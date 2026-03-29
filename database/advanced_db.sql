-- ============================================================
-- FeedbackIQ — ADVANCED DATABASE FEATURES
-- Run AFTER schema.sql
-- Usage: mysql -u root -p feedback_db < advanced_db.sql
-- ============================================================

USE feedback_db;

-- ── Drop existing objects before recreating ──────────────────
DROP TRIGGER IF EXISTS trg_flag_negative;
DROP TRIGGER IF EXISTS trg_auto_categorize;
DROP TRIGGER IF EXISTS trg_update_product_sentiment;
DROP PROCEDURE IF EXISTS sp_insert_feedback;
DROP PROCEDURE IF EXISTS sp_product_sentiment_breakdown;
DROP PROCEDURE IF EXISTS sp_top_customers;
DROP VIEW IF EXISTS vw_daily_sentiment_report;
DROP VIEW IF EXISTS vw_product_sentiment;
DROP VIEW IF EXISTS vw_country_feedback;

-- ============================================================
-- SECTION 1: TRIGGERS
-- ============================================================

DELIMITER //

-- ── Trigger 1: Flag negative feedback ───────────────────────
-- Automatically inserts a record into flagged_feedbacks
-- whenever a negative sentiment feedback is submitted.
CREATE TRIGGER trg_flag_negative
AFTER INSERT ON feedbacks
FOR EACH ROW
BEGIN
  IF NEW.sentiment_label = 'Negative' THEN
    INSERT INTO flagged_feedbacks (feedback_id, reason)
    VALUES (
      NEW.id,
      CONCAT(
        'Auto-flagged: Negative sentiment detected. ',
        'Compound score: ', NEW.sentiment_compound, '. ',
        'Customer: ', NEW.name, ' (', NEW.email, ')'
      )
    );
  END IF;
END//

-- ── Trigger 2: Auto-categorize feedback ─────────────────────
-- Before inserting, if category is NULL or empty,
-- automatically assign category based on message keywords.
CREATE TRIGGER trg_auto_categorize
BEFORE INSERT ON feedbacks
FOR EACH ROW
BEGIN
  IF NEW.category IS NULL OR NEW.category = '' THEN
    IF NEW.message LIKE '%delivery%'
    OR NEW.message LIKE '%shipping%'
    OR NEW.message LIKE '%package%'
    OR NEW.message LIKE '%dispatch%' THEN
      SET NEW.category = 'Delivery';

    ELSEIF NEW.message LIKE '%website%'
    OR NEW.message LIKE '%app%'
    OR NEW.message LIKE '%online%'
    OR NEW.message LIKE '%interface%'
    OR NEW.message LIKE '%portal%' THEN
      SET NEW.category = 'Website';

    ELSEIF NEW.message LIKE '%support%'
    OR NEW.message LIKE '%help%'
    OR NEW.message LIKE '%agent%'
    OR NEW.message LIKE '%responded%'
    OR NEW.message LIKE '%customer service%' THEN
      SET NEW.category = 'Support';

    ELSEIF NEW.message LIKE '%price%'
    OR NEW.message LIKE '%cost%'
    OR NEW.message LIKE '%expensive%'
    OR NEW.message LIKE '%cheap%'
    OR NEW.message LIKE '%value%' THEN
      SET NEW.category = 'Pricing';

    ELSE
      SET NEW.category = 'Product';
    END IF;
  END IF;
END//

-- ── Trigger 3: Update product sentiment score ────────────────
-- After each feedback insert, update the running
-- aggregated sentiment score for that product.
CREATE TRIGGER trg_update_product_sentiment
AFTER INSERT ON feedbacks
FOR EACH ROW
BEGIN
  IF NEW.product_id IS NOT NULL THEN
    INSERT INTO product_sentiment_scores
      (product_id, total_feedbacks, avg_compound,
       positive_count, negative_count, neutral_count)
    VALUES (
      NEW.product_id, 1, NEW.sentiment_compound,
      IF(NEW.sentiment_label = 'Positive', 1, 0),
      IF(NEW.sentiment_label = 'Negative', 1, 0),
      IF(NEW.sentiment_label = 'Neutral',  1, 0)
    )
    ON DUPLICATE KEY UPDATE
      total_feedbacks = total_feedbacks + 1,
      avg_compound    = ROUND(
        (avg_compound * (total_feedbacks) + NEW.sentiment_compound)
        / (total_feedbacks + 1), 4),
      positive_count  = positive_count + IF(NEW.sentiment_label = 'Positive', 1, 0),
      negative_count  = negative_count + IF(NEW.sentiment_label = 'Negative', 1, 0),
      neutral_count   = neutral_count  + IF(NEW.sentiment_label = 'Neutral',  1, 0);
  END IF;
END//

DELIMITER ;

-- ============================================================
-- SECTION 2: STORED PROCEDURES
-- ============================================================

DELIMITER //

-- ── SP 4: Insert new feedback and assign sentiment ───────────
-- Called from application layer with all required fields.
-- Triggers fire automatically after this INSERT.
CREATE PROCEDURE sp_insert_feedback(
  IN p_name            VARCHAR(120),
  IN p_email           VARCHAR(255),
  IN p_message         TEXT,
  IN p_category        VARCHAR(60),
  IN p_rating          TINYINT,
  IN p_country         VARCHAR(100),
  IN p_product_id      INT UNSIGNED,
  IN p_sentiment_label VARCHAR(20),
  IN p_compound        DECIMAL(6,4),
  IN p_positive        DECIMAL(6,4),
  IN p_negative        DECIMAL(6,4),
  IN p_neutral         DECIMAL(6,4)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  INSERT INTO feedbacks (
    name, email, message, category, rating, country, product_id,
    sentiment_label, sentiment_compound,
    sentiment_positive, sentiment_negative, sentiment_neutral
  ) VALUES (
    p_name, p_email, p_message, p_category, p_rating, p_country, p_product_id,
    p_sentiment_label, p_compound, p_positive, p_negative, p_neutral
  );

  COMMIT;

  -- Return the newly inserted feedback
  SELECT f.*, p.name AS product_name
  FROM feedbacks f
  LEFT JOIN products p ON f.product_id = p.id
  WHERE f.id = LAST_INSERT_ID();
END//

-- ── SP 5: Fetch product-wise sentiment breakdown ─────────────
-- Pass 0 or NULL to get ALL products.
-- Pass a specific product_id to filter.
CREATE PROCEDURE sp_product_sentiment_breakdown(
  IN p_product_id INT UNSIGNED
)
BEGIN
  IF p_product_id IS NULL OR p_product_id = 0 THEN
    -- All products
    SELECT
      p.id                                                            AS product_id,
      p.name                                                          AS product_name,
      p.description,
      COUNT(f.id)                                                     AS total_feedbacks,
      ROUND(AVG(f.sentiment_compound), 4)                             AS avg_sentiment,
      SUM(f.sentiment_label = 'Positive')                             AS positive_count,
      SUM(f.sentiment_label = 'Negative')                             AS negative_count,
      SUM(f.sentiment_label = 'Neutral')                              AS neutral_count,
      ROUND(SUM(f.sentiment_label = 'Positive') * 100.0
        / NULLIF(COUNT(f.id), 0), 1)                                  AS positive_pct,
      ROUND(AVG(f.rating), 1)                                         AS avg_rating
    FROM products p
    LEFT JOIN feedbacks f ON p.id = f.product_id
    GROUP BY p.id, p.name, p.description
    ORDER BY avg_sentiment DESC;
  ELSE
    -- Specific product
    SELECT
      p.id                                                            AS product_id,
      p.name                                                          AS product_name,
      p.description,
      COUNT(f.id)                                                     AS total_feedbacks,
      ROUND(AVG(f.sentiment_compound), 4)                             AS avg_sentiment,
      SUM(f.sentiment_label = 'Positive')                             AS positive_count,
      SUM(f.sentiment_label = 'Negative')                             AS negative_count,
      SUM(f.sentiment_label = 'Neutral')                              AS neutral_count,
      ROUND(SUM(f.sentiment_label = 'Positive') * 100.0
        / NULLIF(COUNT(f.id), 0), 1)                                  AS positive_pct,
      ROUND(AVG(f.rating), 1)                                         AS avg_rating
    FROM products p
    LEFT JOIN feedbacks f ON p.id = f.product_id
    WHERE p.id = p_product_id
    GROUP BY p.id, p.name, p.description;
  END IF;
END//

-- ── SP 6: Retrieve top 5 customers by feedback count ─────────
CREATE PROCEDURE sp_top_customers()
BEGIN
  SELECT
    name,
    email,
    country,
    COUNT(*)                              AS feedback_count,
    ROUND(AVG(sentiment_compound), 4)     AS avg_sentiment,
    SUM(sentiment_label = 'Positive')     AS positive_given,
    SUM(sentiment_label = 'Negative')     AS negative_given,
    SUM(sentiment_label = 'Neutral')      AS neutral_given,
    ROUND(AVG(rating), 1)                 AS avg_rating_given,
    MAX(created_at)                       AS last_feedback_date
  FROM feedbacks
  GROUP BY name, email, country
  ORDER BY feedback_count DESC
  LIMIT 5;
END//

DELIMITER ;

-- ============================================================
-- SECTION 3: VIEWS
-- ============================================================

-- ── View 7: Daily feedback sentiment report ──────────────────
CREATE VIEW vw_daily_sentiment_report AS
SELECT
  DATE(created_at)                                                  AS feedback_date,
  DAYNAME(created_at)                                               AS day_name,
  COUNT(*)                                                          AS total_feedbacks,
  SUM(sentiment_label = 'Positive')                                 AS positive_count,
  SUM(sentiment_label = 'Negative')                                 AS negative_count,
  SUM(sentiment_label = 'Neutral')                                  AS neutral_count,
  ROUND(AVG(sentiment_compound), 4)                                 AS avg_compound,
  ROUND(SUM(sentiment_label = 'Positive') * 100.0 / COUNT(*), 1)   AS positive_pct,
  ROUND(AVG(rating), 1)                                             AS avg_rating
FROM feedbacks
GROUP BY DATE(created_at), DAYNAME(created_at)
ORDER BY feedback_date DESC;

-- ── View 8: Product-wise sentiment analysis ──────────────────
CREATE VIEW vw_product_sentiment AS
SELECT
  p.id                                                              AS product_id,
  p.name                                                            AS product_name,
  p.description,
  COUNT(f.id)                                                       AS total_feedbacks,
  ROUND(AVG(f.sentiment_compound), 4)                               AS avg_sentiment_score,
  SUM(f.sentiment_label = 'Positive')                               AS positive_count,
  SUM(f.sentiment_label = 'Negative')                               AS negative_count,
  SUM(f.sentiment_label = 'Neutral')                                AS neutral_count,
  ROUND(SUM(f.sentiment_label = 'Positive') * 100.0
    / NULLIF(COUNT(f.id), 0), 1)                                    AS positive_pct,
  ROUND(AVG(f.rating), 1)                                           AS avg_rating,
  CASE
    WHEN AVG(f.sentiment_compound) >= 0.05  THEN 'Positive'
    WHEN AVG(f.sentiment_compound) <= -0.05 THEN 'Negative'
    ELSE 'Neutral'
  END                                                               AS overall_verdict
FROM products p
LEFT JOIN feedbacks f ON p.id = f.product_id
GROUP BY p.id, p.name, p.description
ORDER BY avg_sentiment_score DESC;

-- ── View 9: Country-wise feedback distribution ───────────────
CREATE VIEW vw_country_feedback AS
SELECT
  COALESCE(country, 'Unknown')                                      AS country,
  COUNT(*)                                                          AS total_feedbacks,
  SUM(sentiment_label = 'Positive')                                 AS positive_count,
  SUM(sentiment_label = 'Negative')                                 AS negative_count,
  SUM(sentiment_label = 'Neutral')                                  AS neutral_count,
  ROUND(AVG(sentiment_compound), 4)                                 AS avg_sentiment,
  ROUND(SUM(sentiment_label = 'Positive') * 100.0 / COUNT(*), 1)   AS positive_pct,
  ROUND(AVG(rating), 1)                                             AS avg_rating,
  COUNT(DISTINCT email)                                             AS unique_customers
FROM feedbacks
GROUP BY country
ORDER BY total_feedbacks DESC;

-- ============================================================
-- SECTION 4: VERIFY INSTALLATION
-- ============================================================

SELECT 'TRIGGERS' AS type, TRIGGER_NAME AS name
FROM information_schema.TRIGGERS
WHERE TRIGGER_SCHEMA = 'feedback_db'
UNION ALL
SELECT 'PROCEDURE', ROUTINE_NAME
FROM information_schema.ROUTINES
WHERE ROUTINE_SCHEMA = 'feedback_db' AND ROUTINE_TYPE = 'PROCEDURE'
UNION ALL
SELECT 'VIEW', TABLE_NAME
FROM information_schema.VIEWS
WHERE TABLE_SCHEMA = 'feedback_db';