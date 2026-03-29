-- ============================================================
-- FeedbackIQ — COMPLETE BASE SCHEMA
-- Run this FIRST before advanced_db.sql
-- Usage: mysql -u root -p < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS feedback_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE feedback_db;

DROP TABLE IF EXISTS flagged_feedbacks;
DROP TABLE IF EXISTS product_sentiment_scores;
DROP TABLE IF EXISTS feedbacks;
DROP TABLE IF EXISTS products;

-- ── Products table ────────────────────────────────────────────
CREATE TABLE products (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name        VARCHAR(120) NOT NULL,
  description TEXT         NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Feedbacks table ───────────────────────────────────────────
CREATE TABLE feedbacks (
  id                  INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  name                VARCHAR(120)     NOT NULL,
  email               VARCHAR(255)     NOT NULL,
  message             TEXT             NOT NULL,
  category            VARCHAR(60)      NULL DEFAULT NULL,
  rating              TINYINT UNSIGNED NOT NULL DEFAULT 0,
  country             VARCHAR(100)     NOT NULL DEFAULT '',
  product_id          INT UNSIGNED     NULL DEFAULT NULL,
  sentiment_label     ENUM('Positive','Negative','Neutral') NOT NULL DEFAULT 'Neutral',
  sentiment_compound  DECIMAL(6,4)     NOT NULL DEFAULT 0.0000,
  sentiment_positive  DECIMAL(6,4)     NOT NULL DEFAULT 0.0000,
  sentiment_negative  DECIMAL(6,4)     NOT NULL DEFAULT 0.0000,
  sentiment_neutral   DECIMAL(6,4)     NOT NULL DEFAULT 0.0000,
  created_at          TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_sentiment_label (sentiment_label),
  INDEX idx_created_at (created_at),
  INDEX idx_country (country),
  INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Flagged feedbacks (auto-filled by Trigger 1) ─────────────
CREATE TABLE flagged_feedbacks (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  feedback_id INT UNSIGNED NOT NULL,
  reason      VARCHAR(255) NOT NULL,
  flagged_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (feedback_id) REFERENCES feedbacks(id) ON DELETE CASCADE,
  INDEX idx_feedback_id (feedback_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Product sentiment scores (auto-filled by Trigger 3) ──────
CREATE TABLE product_sentiment_scores (
  product_id      INT UNSIGNED NOT NULL,
  total_feedbacks INT          NOT NULL DEFAULT 0,
  avg_compound    DECIMAL(6,4) NOT NULL DEFAULT 0.0000,
  positive_count  INT          NOT NULL DEFAULT 0,
  negative_count  INT          NOT NULL DEFAULT 0,
  neutral_count   INT          NOT NULL DEFAULT 0,
  last_updated    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (product_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Seed: Products (matches form dropdown options) ────────────
INSERT INTO products (id, name, description) VALUES
(1, 'Product',  'Hardware or physical product feedback'),
(2, 'Service',  'Customer service and support experience'),
(3, 'Website',  'Website and web app usability feedback'),
(4, 'Support',  'Technical support and helpdesk feedback');

-- ── Seed: Feedbacks (12 rows with all fields) ─────────────────
INSERT INTO feedbacks
  (name, email, message, category, rating, country, product_id,
   sentiment_label, sentiment_compound, sentiment_positive, sentiment_negative, sentiment_neutral)
VALUES
('Alice Johnson',  'alice@example.com',  'Absolutely love your service! Everything works perfectly and the support team is amazing.',  'Service',  5, 'India',       2, 'Positive',  0.8779, 0.4820, 0.0000, 0.5180),
('Bob Martinez',   'bob@example.com',    'The product is okay but delivery was really slow and packaging was damaged.',                  'Product',  2, 'USA',         1, 'Negative', -0.4215, 0.0000, 0.2280, 0.7720),
('Carol White',    'carol@example.com',  'I received my order today. It came in a box.',                                                 'Product',  3, 'UK',          1, 'Neutral',   0.0000, 0.0000, 0.0000, 1.0000),
('David Kim',      'david@example.com',  'Fantastic experience from start to finish! Will definitely order again.',                      'Website',  5, 'Australia',   3, 'Positive',  0.7650, 0.4530, 0.0000, 0.5470),
('Eva Chen',       'eva@example.com',    'Terrible customer service. Nobody responded to my emails for two weeks.',                      'Support',  1, 'Germany',     4, 'Negative', -0.6597, 0.0000, 0.3420, 0.6580),
('Ravi Sharma',    'ravi@example.com',   'Great platform! The AI insights are very helpful for our business decisions.',                 'Service',  5, 'India',       2, 'Positive',  0.8120, 0.5100, 0.0000, 0.4900),
('Sara Lee',       'sara@example.com',   'The app crashes sometimes. Support helped but it took time to resolve.',                       'Support',  3, 'Singapore',   4, 'Neutral',   0.0400, 0.1200, 0.0800, 0.8000),
('James Wilson',   'james@example.com',  'Amazing website experience! Navigation is seamless and fast.',                                'Website',  5, 'Canada',      3, 'Positive',  0.9100, 0.5600, 0.0000, 0.4400),
('Priya Patel',    'priya@example.com',  'Service is slow and the interface is confusing. Needs serious improvement.',                   'Service',  2, 'India',       2, 'Negative', -0.5200, 0.0000, 0.3100, 0.6900),
('Tom Brown',      'tom@example.com',    'Decent product. Nothing exceptional but gets the job done.',                                   'Product',  3, 'USA',         1, 'Neutral',   0.0200, 0.0800, 0.0000, 0.9200),
('Mei Zhang',      'mei@example.com',    'The support team resolved my issue immediately. Outstanding service.',                         'Support',  5, 'Singapore',   4, 'Positive',  0.8500, 0.5000, 0.0000, 0.5000),
('Carlos Gomez',   'carlos@example.com', 'Website is buggy and keeps logging me out. Very frustrating experience.',                      'Website',  1, 'USA',         3, 'Negative', -0.7100, 0.0000, 0.4200, 0.5800);

SELECT id, name, rating, country, product_id, sentiment_label FROM feedbacks;