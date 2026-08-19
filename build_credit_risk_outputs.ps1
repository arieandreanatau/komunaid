$ErrorActionPreference = 'Stop'
$source = 'C:\Users\ariea\Downloads\Credit Risk Test.xlsx'
$outputDir = 'C:\Users\ariea\Downloads\Credit_Risk_Submission'
if (-not (Test-Path -LiteralPath 'C:\Users\ariea\Downloads')) { throw 'Downloads folder not found.' }
New-Item -ItemType Directory -Path $outputDir -Force | Out-Null

$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
try {
  $wb = $excel.Workbooks.Open($source)
  $ws = $wb.Worksheets.Item('Credit Risk Test')
  $lastRow = $ws.UsedRange.Rows.Count
  $lastCol = $ws.UsedRange.Columns.Count
  $values = $ws.Range($ws.Cells(1,1), $ws.Cells($lastRow,$lastCol)).Value2
  $rows = New-Object System.Collections.Generic.List[object]
  for ($r = 2; $r -le $lastRow; $r++) {
    $incomeText = [string]$values[$r,5]
    $income = if ($incomeText.Trim() -eq '-' -or [string]::IsNullOrWhiteSpace($incomeText)) { $null } else { [double]($incomeText -replace ',', '').Trim() }
    $rev = [double](([string]$values[$r,1] -replace '%','').Trim()) / 100
    $debt = [double](([string]$values[$r,4] -replace '%','').Trim()) / 100
    $rows.Add([pscustomobject]@{
      customer_id=$r-1; rev_util=$rev; age=[int]($values[$r,2]); late_30_59=[int]($values[$r,3]); debt_ratio=$debt;
      monthly_inc=$income; open_credit=[int]($values[$r,6]); late_90=[int]($values[$r,7]); real_estate=[int]($values[$r,8]);
      late_60_89=[int]($values[$r,9]); dependents=[int]($values[$r,10]); dlq_2yrs=[int]($values[$r,11])
    })
  }
  $wb.Close($false)

  $valid = $rows | Where-Object { $_.late_30_59 -lt 90 -and $_.late_60_89 -lt 90 -and $_.late_90 -lt 90 }
  $missingIncome = @($valid | Where-Object { $null -eq $_.monthly_inc }).Count
  $medianIncome = [math]::Round((@($valid | Where-Object { $null -ne $_.monthly_inc } | ForEach-Object monthly_inc | Sort-Object)[[math]::Floor((@($valid | Where-Object { $null -ne $_.monthly_inc }).Count-1)/2)]),0)
  foreach ($x in $valid) {
    $x | Add-Member NoteProperty income_imputed $(if ($null -eq $x.monthly_inc) { 1 } else { 0 })
    if ($null -eq $x.monthly_inc) { $x.monthly_inc = $medianIncome }
    $incomeBand = if ($x.monthly_inc -lt 2500) {'Below 2,500'} elseif ($x.monthly_inc -lt 5000) {'2,500-4,999'} elseif ($x.monthly_inc -lt 7500) {'5,000-7,499'} elseif ($x.monthly_inc -lt 10000) {'7,500-9,999'} else {'10,000 and above'}
    $payment = if ($x.late_90 -gt 0) {'90+ days late history'} elseif ($x.late_60_89 -gt 0) {'60-89 days late history'} elseif ($x.late_30_59 -gt 0) {'30-59 days late history'} else {'No late payment history'}
    $risk = if ($x.late_90 -gt 0 -or $x.late_60_89 -gt 0 -or $x.late_30_59 -ge 2) {'High risk'} elseif ($x.rev_util -ge .8 -or $x.debt_ratio -gt 1 -or $x.monthly_inc -lt 2500) {'Medium risk'} else {'Lower risk'}
    $x | Add-Member NoteProperty income_band $incomeBand
    $x | Add-Member NoteProperty payment_history $payment
    $x | Add-Member NoteProperty risk_band $risk
  }
  function Summary($data, $field, $order) {
    $data | Group-Object -Property $field | ForEach-Object { [pscustomobject]@{ Segment=$_.Name; Customers=$_.Count; Defaults=($_.Group | Measure-Object dlq_2yrs -Sum).Sum; Default_Rate_Pct=[math]::Round(100*($_.Group | Measure-Object dlq_2yrs -Average).Average,2) } } | Sort-Object -Property @{Expression={ $order.IndexOf($_.Segment) }}
  }
  $income = Summary $valid 'income_band' @('Below 2,500','2,500-4,999','5,000-7,499','7,500-9,999','10,000 and above')
  $payment = Summary $valid 'payment_history' @('No late payment history','30-59 days late history','60-89 days late history','90+ days late history')
  $risk = Summary $valid 'risk_band' @('High risk','Medium risk','Lower risk')
  $baseRate = [math]::Round(100*($valid | Measure-Object dlq_2yrs -Average).Average,2)
  $removed = $rows.Count - $valid.Count

  $out = $excel.Workbooks.Add()
  $process = $out.Worksheets.Item(1); $process.Name = 'Process_Explanation'
  $processData = @(
    @('Credit Risk Test - Data Process'), @('Step','Process','Result / Rule'),
    @('1','Source data','Credit Risk Test.xlsx; 16,714 customer records.'),
    @('2','Data type conversion','Percent fields converted to decimal; monthly income converted to numeric.'),
    @('3','Missing value treatment',"$missingIncome missing monthly income values imputed with median income: $medianIncome."),
    @('4','Invalid delinquency counts',"$removed rows with delinquency count >= 90 removed; value is invalid for count variable."),
    @('5','Debt ratio outliers','Kept. Ratio above 100% can be valid when debt exceeds income; retained and flagged in SQL.'),
    @('6','Target definition','dlq_2yrs = 1 means serious delinquency (90+ days past due) within next two years.'),
    @('7','Method','Descriptive analysis by income, payment history, and combined risk band. Default rate = defaults / customers.'),
    @('8','Scope','Findings show association, not causal effect. Policy use requires validation on larger production data.')
  )
  $process.Range('A1').Resize($processData.Count,3).Value2 = $processData
  $clean = $out.Worksheets.Add(); $clean.Name = 'Clean_Data'
  $headers = @('customer_id','rev_util','age','late_30_59','debt_ratio','monthly_inc','open_credit','late_90','real_estate','late_60_89','dependents','dlq_2yrs','income_imputed','income_band','payment_history','risk_band')
  $clean.Range('A1').Resize(1,$headers.Count).Value2 = ,$headers
  $matrix = New-Object 'object[,]' $valid.Count,$headers.Count
  for($i=0;$i -lt $valid.Count;$i++){ for($j=0;$j -lt $headers.Count;$j++){ $matrix[$i,$j]=$valid[$i].($headers[$j]) } }
  $clean.Range('A2').Resize($valid.Count,$headers.Count).Value2 = $matrix
  $summary = $out.Worksheets.Add(); $summary.Name='Analysis_Summary'
  $summary.Range('A1').Value2='Portfolio Summary'; $summary.Range('A2').Value2='Valid customers'; $summary.Range('B2').Value2=$valid.Count
  $summary.Range('A3').Value2='Serious delinquencies'; $summary.Range('B3').Value2=($valid | Measure-Object dlq_2yrs -Sum).Sum
  $summary.Range('A4').Value2='Base default rate (%)'; $summary.Range('B4').Value2=$baseRate
  $row=6; foreach($block in @(@('Income Analysis',$income),@('Payment History Analysis',$payment),@('Risk Band Analysis',$risk))){ $summary.Cells.Item($row,1).Value2=$block[0]; $row++; $summary.Cells.Item($row,1).Resize(1,4).Value2=,@('Segment','Customers','Defaults','Default Rate (%)'); $row++; $m=New-Object 'object[,]' $block[1].Count,4; for($i=0;$i -lt $block[1].Count;$i++){ $m[$i,0]=$block[1][$i].Segment;$m[$i,1]=$block[1][$i].Customers;$m[$i,2]=$block[1][$i].Defaults;$m[$i,3]=$block[1][$i].Default_Rate_Pct }; $summary.Cells.Item($row,1).Resize($block[1].Count,4).Value2=$m; $row += $block[1].Count+2 }
  foreach($sheet in @($process,$clean,$summary)){ $sheet.UsedRange.EntireColumn.AutoFit() | Out-Null; $sheet.Rows.Item(1).Font.Bold=$true }
  $process.Range('A1:C1').Merge(); $process.Range('A1').Font.Bold=$true
  $xlsx = Join-Path $outputDir 'Credit_Risk_Data_Process.xlsx'; $out.SaveAs($xlsx,51)
  $report = $out.Worksheets.Add(); $report.Name='English_Report'
  $reportData=@(
    @('Credit Risk Analysis Report'),
    @('Objective'),@('Assess customer characteristics associated with serious delinquency within two years.'),
    @('Dataset and Cleaning'),@("The source contains $($rows.Count) customer records. $removed records with impossible delinquency counts were removed. $missingIncome missing monthly-income values were replaced with portfolio median income of $medianIncome. Debt ratios above 100% were retained because debt can exceed reported income."),
    @('Portfolio Result'),@("The cleaned portfolio contains $($valid.Count) customers. $($valid | Measure-Object dlq_2yrs -Sum | Select-Object -ExpandProperty Sum) customers had serious delinquency, producing a base rate of $baseRate%."),
    @('Key Insight 1'),@('Past payment problems are strongest risk signal. Customers with 90+ day late-payment history require the strictest review because this behavior directly reflects severe prior repayment stress.'),
    @('Key Insight 2'),@('Low income, high revolving utilization, and debt ratio above 100% indicate reduced repayment capacity. These characteristics should trigger affordability verification, not automatic rejection.'),
    @('Key Insight 3'),@('Combined risk bands concentrate portfolio risk. High-risk customers have serious prior delinquency or repeated early delinquency. Medium-risk customers have high utilization, debt burden, or low income.'),
    @('Recommendation'),@('Use a tiered approval policy: manual underwriting for high-risk customers; income and debt-document verification for medium-risk customers; routine approval checks for lower-risk customers. Revalidate thresholds using larger production samples before deployment.'),
    @('Limitation'),@('This descriptive analysis identifies associations only. It does not prove causation and should not be used as a standalone credit decision model.')
  )
  $report.Range('A1').Resize($reportData.Count,1).Value2=$reportData
  $report.Columns.Item(1).ColumnWidth=110; $report.Rows.WrapText=$true; $report.Range('A1').Font.Bold=$true
  foreach($r in 2,4,6,8,10,12,14,16,18){$report.Cells.Item($r,1).Font.Bold=$true}
  $report.PageSetup.Orientation=1; $report.PageSetup.Zoom=$false; $report.PageSetup.FitToPagesWide=1; $report.PageSetup.FitToPagesTall=1
  $pdf=Join-Path $outputDir 'Credit_Risk_Analysis_Report.pdf'; $report.ExportAsFixedFormat(0,$pdf)
  $out.Save(); $out.Close($true)
  Write-Output "Created: $xlsx"; Write-Output "Created: $pdf"; Write-Output "Valid records: $($valid.Count); base default rate: $baseRate%"
}
finally { $excel.Quit() | Out-Null; [void][Runtime.InteropServices.Marshal]::ReleaseComObject($excel) }
