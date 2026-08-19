-- Credit Risk Test: MySQL 8.0 cleaning and analysis
-- Import file source as text first. Keep raw table unchanged for audit.

CREATE DATABASE IF NOT EXISTS credit_risk_test;
USE credit_risk_test;

CREATE TABLE credit_risk_raw (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    rev_util_raw VARCHAR(30),
    age_raw VARCHAR(20),
    late_30_59_raw VARCHAR(20),
    debt_ratio_raw VARCHAR(30),
    monthly_inc_raw VARCHAR(30),
    open_credit_raw VARCHAR(20),
    late_90_raw VARCHAR(20),
    real_estate_raw VARCHAR(20),
    late_60_89_raw VARCHAR(20),
    dependents_raw VARCHAR(20),
    dlq_2yrs_raw VARCHAR(20)
);

-- Import CSV exported from sheet Credit Risk Test.
-- LOAD DATA LOCAL INFILE 'C:/Users/ariea/Downloads/credit_risk_raw.csv'
-- INTO TABLE credit_risk_raw
-- FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n'
-- IGNORE 1 LINES
-- (rev_util_raw, age_raw, late_30_59_raw, debt_ratio_raw, monthly_inc_raw,
--  open_credit_raw, late_90_raw, real_estate_raw, late_60_89_raw,
--  dependents_raw, dlq_2yrs_raw);

CREATE TABLE credit_risk_clean AS
SELECT
    customer_id,
    CAST(REPLACE(REPLACE(TRIM(rev_util_raw), '%', ''), ',', '') AS DECIMAL(12,6)) / 100 AS rev_util,
    CAST(age_raw AS UNSIGNED) AS age,
    CAST(late_30_59_raw AS UNSIGNED) AS late_30_59,
    CAST(REPLACE(REPLACE(TRIM(debt_ratio_raw), '%', ''), ',', '') AS DECIMAL(16,6)) / 100 AS debt_ratio,
    NULLIF(CAST(REPLACE(TRIM(monthly_inc_raw), ',', '') AS DECIMAL(14,2)), 0) AS monthly_inc,
    CAST(open_credit_raw AS UNSIGNED) AS open_credit,
    CAST(late_90_raw AS UNSIGNED) AS late_90,
    CAST(real_estate_raw AS UNSIGNED) AS real_estate,
    CAST(late_60_89_raw AS UNSIGNED) AS late_60_89,
    CAST(dependents_raw AS UNSIGNED) AS dependents,
    CAST(dlq_2yrs_raw AS UNSIGNED) AS dlq_2yrs
FROM credit_risk_raw;

-- Flag, do not delete, unusual values. Debt ratio can exceed 100%.
ALTER TABLE credit_risk_clean
ADD COLUMN income_missing TINYINT AS (monthly_inc IS NULL) STORED,
ADD COLUMN delinquency_invalid TINYINT AS
  (late_30_59 >= 90 OR late_60_89 >= 90 OR late_90 >= 90) STORED,
ADD COLUMN debt_ratio_extreme TINYINT AS (debt_ratio > 10) STORED;

-- Dataset quality control.
SELECT COUNT(*) AS total_records,
       SUM(income_missing) AS missing_monthly_income,
       SUM(delinquency_invalid) AS invalid_delinquency_counts,
       SUM(debt_ratio_extreme) AS extreme_debt_ratio_records
FROM credit_risk_clean;

-- Base default rate.
SELECT COUNT(*) AS customers,
       SUM(dlq_2yrs) AS serious_delinquencies,
       ROUND(100 * AVG(dlq_2yrs), 2) AS default_rate_pct
FROM credit_risk_clean;

-- Income segmentation.
SELECT income_band, COUNT(*) AS customers, SUM(dlq_2yrs) AS defaults,
       ROUND(100 * AVG(dlq_2yrs), 2) AS default_rate_pct
FROM (
  SELECT *, CASE
    WHEN monthly_inc IS NULL THEN 'Missing income'
    WHEN monthly_inc < 2500 THEN 'Below 2,500'
    WHEN monthly_inc < 5000 THEN '2,500-4,999'
    WHEN monthly_inc < 7500 THEN '5,000-7,499'
    WHEN monthly_inc < 10000 THEN '7,500-9,999'
    ELSE '10,000 and above' END AS income_band
  FROM credit_risk_clean
) s
GROUP BY income_band
ORDER BY FIELD(income_band, 'Below 2,500', '2,500-4,999', '5,000-7,499',
                             '7,500-9,999', '10,000 and above', 'Missing income');

-- Past delinquency segmentation. Strongest behavioral risk indicator.
SELECT payment_history, COUNT(*) AS customers, SUM(dlq_2yrs) AS defaults,
       ROUND(100 * AVG(dlq_2yrs), 2) AS default_rate_pct
FROM (
  SELECT *, CASE
    WHEN late_90 > 0 THEN '90+ days late history'
    WHEN late_60_89 > 0 THEN '60-89 days late history'
    WHEN late_30_59 > 0 THEN '30-59 days late history'
    ELSE 'No late payment history' END AS payment_history
  FROM credit_risk_clean
) s
GROUP BY payment_history
ORDER BY default_rate_pct DESC;

-- Combined policy screen. Use for review queue, not automatic rejection.
SELECT risk_band, COUNT(*) AS customers, SUM(dlq_2yrs) AS defaults,
       ROUND(100 * AVG(dlq_2yrs), 2) AS default_rate_pct
FROM (
  SELECT *, CASE
    WHEN late_90 > 0 OR late_60_89 > 0 OR late_30_59 >= 2 THEN 'High risk'
    WHEN rev_util >= 0.80 OR debt_ratio > 1 OR monthly_inc < 2500 THEN 'Medium risk'
    ELSE 'Lower risk' END AS risk_band
  FROM credit_risk_clean
) s
GROUP BY risk_band
ORDER BY FIELD(risk_band, 'High risk', 'Medium risk', 'Lower risk');
