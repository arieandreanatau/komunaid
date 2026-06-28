param(
    [string]$BaseUrl = 'http://127.0.0.1:8000',
    [string]$OutputCsv = 'C:\xampp\htdocs\komunaid\storage\qa\local_smoke_results.csv'
)

$ErrorActionPreference = 'Continue'
New-Item -ItemType Directory -Force -Path (Split-Path $OutputCsv) | Out-Null

$results = New-Object System.Collections.Generic.List[object]

function Run-Test {
    param(
        [string]$Id,
        [string]$Method,
        [string]$Path,
        [string]$Expected,
        [string]$Body = $null,
        [string]$CookieFile = $null
    )
    $url = "$BaseUrl$Path"
    $opts = @{
        Uri = $url
        Method = $Method
        UseBasicParsing = $true
        TimeoutSec = 15
        MaximumRedirection = 0
        ErrorAction = 'Stop'
    }
    if ($CookieFile) { $opts.CookieJar = $CookieFile; $opts.CookieContainer = (New-Object System.Net.CookieContainer) }
    if ($Body) { $opts.Body = $Body; $opts.ContentType = 'application/x-www-form-urlencoded' }
    try {
        $r = Invoke-WebRequest @opts
        $code = $r.StatusCode
        $loc  = $r.Headers['Location']
    } catch {
        $code = '?'
        try { $code = [int]$_.Exception.Response.StatusCode } catch {}
        $loc = $null
    }
    $pass = '?'
    if ($Expected -eq '200') { $pass = if ($code -eq 200) {'PASS'} else {'FAIL'} }
    elseif ($Expected -eq '302') { $pass = if ($code -eq 302) {'PASS'} else {'FAIL'} }
    elseif ($Expected -eq '403') { $pass = if ($code -eq 403) {'PASS'} else {'FAIL'} }
    elseif ($Expected -eq '404') { $pass = if ($code -eq 404) {'PASS'} else {'FAIL'} }
    elseif ($Expected -like '302->*') {
        $expectedLoc = $Expected.Substring(6)
        $pass = if ($code -eq 302 -and $loc -like "*$expectedLoc*") {'PASS'} else {'FAIL'}
    }
    $script:results.Add([pscustomobject]@{
        Id = $Id; Method = $Method; Path = $Path; Expected = $Expected
        Status = $code; Location = $loc; Result = $pass
    })
    Write-Host ("{0,-6} {1,-4} {2,-32} exp={3,-22} got={4,4} loc={5} {6}" -f $Id, $Method, $Path, $Expected, $code, $loc, $pass)
}

# ===== P: Public =====
Run-Test P01 GET  '/'           '200'
Run-Test P02 GET  '/komunitas'  '200'
Run-Test P03 GET  '/events'     '200'
Run-Test P04 GET  '/blog'       '200'
Run-Test P05 GET  '/about'      '200'
Run-Test P06 GET  '/contact'    '200'
Run-Test P07 GET  '/login'      '200'
Run-Test P08 GET  '/register'   '200'
Run-Test P09 GET  '/up'         '200'
Run-Test P10 GET  '/account-restricted' '200'
Run-Test P11 GET  '/admin/login' '200'
Run-Test P12 GET  '/tentang-kami' '200'
Run-Test P13 GET  '/hubungi-kami' '200'
Run-Test P14 GET  '/event'       '200'
Run-Test P15 GET  '/member'      '404'
Run-Test P16 GET  '/superadmin'  '404'
Run-Test P17 GET  '/community-own' '404'
Run-Test P18 GET  '/brand'       '404'
Run-Test P19 GET  '/company-owner' '404'
Run-Test P20 GET  '/nonexistent'  '404'

# ===== N: Negative (guest) =====
Run-Test N01 GET  '/superadmin'  '404'
Run-Test N02 GET  '/admin'       '404'

$results | Export-Csv -NoTypeInformation -Path $OutputCsv -Encoding UTF8
Write-Host ""
Write-Host "Results saved to $OutputCsv"
Write-Host ("PASS: {0}  FAIL: {1}  TOTAL: {2}" -f (($results|?{$_.Result -eq 'PASS'}).Count), (($results|?{$_.Result -eq 'FAIL'}).Count), $results.Count)
