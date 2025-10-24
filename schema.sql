CREATE DATABASE IF NOT EXISTS bento_pos;
USE bento_pos;

-- TEMPORARY REMOVE THIS ON PRODUCTION (FOR TESTING)
DROP TABLE IF EXISTS EVENT_OUTBOX;
DROP TABLE IF EXISTS PAYMENT;
DROP TABLE IF EXISTS STOCK;
DROP TABLE IF EXISTS ORDER_PROMOTION;
DROP TABLE IF EXISTS ORDER_LINE;
DROP TABLE IF EXISTS ORDERS;
DROP TABLE IF EXISTS MEAL_TYPE_LINK;
DROP TABLE IF EXISTS MEAL_TYPE;
DROP TABLE IF EXISTS MEAL_SALE;
DROP TABLE IF EXISTS REVIEWS;
DROP TABLE IF EXISTS PROMOTION;
DROP TABLE IF EXISTS PAYMENT_METHOD;
DROP TABLE IF EXISTS SALE_EVENT;
DROP TABLE IF EXISTS CUSTOMER;
DROP TABLE IF EXISTS STAFF;
DROP TABLE IF EXISTS MEAL;
DROP TABLE IF EXISTS USER_ACCOUNT;

CREATE TABLE USER_ACCOUNT (
  user_id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username        VARCHAR(50)  NOT NULL,
  user_password   VARCHAR(255) NOT NULL,
  email           VARCHAR(255) NOT NULL,
  user_role       SMALLINT     NOT NULL,
  created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
  last_updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  UNIQUE KEY uq_user_username (username),
  UNIQUE KEY uq_user_email    (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE STAFF (
  staff_id        INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_ref        INT UNSIGNED NOT NULL,
  first_name      VARCHAR(50)  NOT NULL,
  last_name       VARCHAR(50)  NOT NULL,
  phone_number    VARCHAR(12)  NOT NULL,
  hire_date       DATE         NOT NULL,
  salary          INT UNSIGNED NOT NULL,
  created_by      INT UNSIGNED NOT NULL,
  created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_by      INT UNSIGNED DEFAULT NULL,
  last_updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (staff_id),
  UNIQUE KEY uq_staff_user_ref (user_ref),
  KEY idx_staff_created_by (created_by),
  KEY idx_staff_updated_by (updated_by),
  CONSTRAINT fk_staff_user       FOREIGN KEY (user_ref)   REFERENCES USER_ACCOUNT(user_id) ON DELETE RESTRICT,
  CONSTRAINT fk_staff_createdby  FOREIGN KEY (created_by) REFERENCES STAFF(staff_id)       ON DELETE RESTRICT,
  CONSTRAINT fk_staff_updatedby  FOREIGN KEY (updated_by) REFERENCES STAFF(staff_id)       ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE CUSTOMER (
  customer_id        INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_ref           INT UNSIGNED NOT NULL,
  first_name         VARCHAR(50)  NOT NULL,
  last_name          VARCHAR(50)  NOT NULL,
  street             VARCHAR(50)  DEFAULT NULL,
  city               VARCHAR(50)  DEFAULT NULL,
  state_code         CHAR(2)      DEFAULT NULL,
  zipcode            CHAR(5)      DEFAULT NULL,
  phone_number       VARCHAR(12)  DEFAULT NULL,
  refunds_per_month  TINYINT UNSIGNED DEFAULT NULL,
  loyalty_points     INT UNSIGNED DEFAULT NULL,
  total_amount_spent INT UNSIGNED DEFAULT NULL,
  created_at         DATETIME     DEFAULT CURRENT_TIMESTAMP,
  last_updated_at    DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (customer_id),
  UNIQUE KEY uq_customer_user_ref (user_ref),
  CONSTRAINT fk_customer_user FOREIGN KEY (user_ref) REFERENCES USER_ACCOUNT(user_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE PAYMENT_METHOD (
  payment_method_id  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  customer_ref       INT UNSIGNED NOT NULL,
  payment_type       TINYINT UNSIGNED NOT NULL,
  last_four          CHAR(4)      DEFAULT NULL,
  exp_date           CHAR(5)      DEFAULT NULL,
  billing_street     VARCHAR(50)  NOT NULL,
  billing_city       VARCHAR(50)  NOT NULL,
  billing_state_code CHAR(2)      NOT NULL,
  billing_zipcode    CHAR(5)      NOT NULL,
  first_name         VARCHAR(50)  NOT NULL,
  middle_init        CHAR(1)      DEFAULT NULL,
  last_name          VARCHAR(50)  NOT NULL,
  created_at         DATETIME     DEFAULT CURRENT_TIMESTAMP,
  last_updated_at    DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (payment_method_id),
  KEY idx_pm_customer (customer_ref),
  CONSTRAINT fk_pm_customer FOREIGN KEY (customer_ref) REFERENCES CUSTOMER(customer_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE PROMOTION (
  promotion_id     INT UNSIGNED NOT NULL AUTO_INCREMENT,
  promo_description VARCHAR(255) NOT NULL,
  promo_type       TINYINT UNSIGNED NOT NULL,
  promo_code       VARCHAR(50)  NOT NULL,
  promo_exp_date   DATE         NOT NULL,
  created_by       INT UNSIGNED NOT NULL,
  created_at       DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_by       INT UNSIGNED DEFAULT NULL,
  last_updated_at  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (promotion_id),
  UNIQUE KEY uq_promo_code (promo_code),
  KEY idx_promo_created_by (created_by),
  KEY idx_promo_updated_by (updated_by),
  CONSTRAINT fk_promo_createdby FOREIGN KEY (created_by) REFERENCES STAFF(staff_id) ON DELETE RESTRICT,
  CONSTRAINT fk_promo_updatedby FOREIGN KEY (updated_by) REFERENCES STAFF(staff_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE MEAL (
  meal_id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  meal_name        VARCHAR(50)  NOT NULL,
  meal_description VARCHAR(255) NOT NULL,
  meal_status      TINYINT NOT NULL,
  nutrition_facts  JSON NOT NULL,
  times_refunded   INT UNSIGNED DEFAULT 0,
  start_date       DATE NOT NULL,
  end_date         DATE NOT NULL,
  created_by       INT UNSIGNED NOT NULL,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_by       INT UNSIGNED DEFAULT NULL,
  last_updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  price            INT UNSIGNED NOT NULL,
  cost_to_make     INT UNSIGNED NOT NULL,
  PRIMARY KEY (meal_id),
  KEY idx_meal_created_by (created_by),
  KEY idx_meal_updated_by (updated_by),
  CONSTRAINT fk_meal_createdby FOREIGN KEY (created_by) REFERENCES STAFF(staff_id) ON DELETE RESTRICT,
  CONSTRAINT fk_meal_updatedby FOREIGN KEY (updated_by) REFERENCES STAFF(staff_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE MEAL_TYPE (
  meal_type_id  TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  meal_type     VARCHAR(50)      NOT NULL,
  PRIMARY KEY (meal_type_id),
  UNIQUE KEY uq_meal_type (meal_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE MEAL_TYPE_LINK (
  meal_ref       INT UNSIGNED NOT NULL,
  meal_type_ref  TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (meal_ref, meal_type_ref),
  KEY idx_mtl_type (meal_type_ref),
  CONSTRAINT fk_mtl_meal FOREIGN KEY (meal_ref) REFERENCES MEAL(meal_id) ON DELETE CASCADE,
  CONSTRAINT fk_mtl_type FOREIGN KEY (meal_type_ref) REFERENCES MEAL_TYPE(meal_type_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE REVIEWS (
  customer_ref INT UNSIGNED NOT NULL,
  meal_ref     INT UNSIGNED NOT NULL,
  stars        TINYINT UNSIGNED NOT NULL,
  user_comment VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (customer_ref, meal_ref),
  KEY idx_reviews_meal (meal_ref),
  CONSTRAINT fk_reviews_customer FOREIGN KEY (customer_ref) REFERENCES CUSTOMER(customer_id) ON DELETE RESTRICT,
  CONSTRAINT fk_reviews_meal     FOREIGN KEY (meal_ref) REFERENCES MEAL(meal_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- sale events 
CREATE TABLE SALE_EVENT (
  sale_event_id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  event_name              VARCHAR(50)  NOT NULL,
  event_description       VARCHAR(255) NOT NULL,
  event_start             DATE NOT NULL,
  event_end               DATE NOT NULL,
  sitewide_promo_type     TINYINT UNSIGNED DEFAULT NULL,
  sitewide_discount_value DECIMAL(4,2) DEFAULT NULL,
  created_by              INT UNSIGNED NOT NULL,
  created_at              DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_by              INT UNSIGNED DEFAULT NULL,
  last_updated_at         DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (sale_event_id),
  KEY idx_se_created_by (created_by),
  KEY idx_se_updated_by (updated_by),
  CONSTRAINT fk_se_createdby FOREIGN KEY (created_by) REFERENCES STAFF(staff_id) ON DELETE RESTRICT,
  CONSTRAINT fk_se_updatedby FOREIGN KEY (updated_by) REFERENCES STAFF(staff_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE MEAL_SALE (
  meal_ref       INT UNSIGNED NOT NULL,
  sale_event_ref INT UNSIGNED NOT NULL,
  discount_rate  DECIMAL(4,2) NOT NULL,
  PRIMARY KEY (meal_ref, sale_event_ref),
  KEY idx_ms_sale (sale_event_ref),
  CONSTRAINT fk_ms_meal FOREIGN KEY (meal_ref) REFERENCES MEAL(meal_id) ON DELETE CASCADE,
  CONSTRAINT fk_ms_se   FOREIGN KEY (sale_event_ref) REFERENCES SALE_EVENT(sale_event_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE ORDERS (
  order_id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  customer_ref        INT UNSIGNED NOT NULL,
  order_date          DATE NOT NULL,
  order_status        TINYINT DEFAULT NULL,
  delivery_date       DATE DEFAULT NULL,
  unit_price          INT NOT NULL,
  tax                 INT NOT NULL,
  discount            INT DEFAULT 0,
  notes               VARCHAR(255) DEFAULT NULL,
  refund_message      VARCHAR(255) DEFAULT NULL,
  shipping_street     VARCHAR(50) DEFAULT NULL,
  shipping_city       VARCHAR(50) DEFAULT NULL,
  shipping_state_code CHAR(2) DEFAULT NULL,
  shipping_zipcode    CHAR(5) DEFAULT NULL,
  created_by          INT UNSIGNED NOT NULL,
  created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_by_staff    INT UNSIGNED DEFAULT NULL,
  updated_by_customer INT UNSIGNED DEFAULT NULL,
  last_updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  tracking_number     VARCHAR(50)  DEFAULT NULL,
  PRIMARY KEY (order_id),
  KEY idx_orders_customer(customer_ref),
  KEY idx_orders_created_by(created_by),
  KEY idx_orders_updated_staff(updated_by_staff),
  KEY idx_orders_updated_customer(updated_by_customer),
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_ref) REFERENCES CUSTOMER(customer_id) ON DELETE RESTRICT,
  CONSTRAINT fk_orders_createdby FOREIGN KEY (created_by) REFERENCES STAFF(staff_id) ON DELETE RESTRICT,
  CONSTRAINT fk_orders_updated_staff FOREIGN KEY (updated_by_staff) REFERENCES STAFF(staff_id) ON DELETE SET NULL,
  CONSTRAINT fk_orders_updated_customer FOREIGN KEY (updated_by_customer) REFERENCES CUSTOMER(customer_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE ORDER_LINE (
  order_ref         INT UNSIGNED NOT NULL,
  meal_ref          INT UNSIGNED NOT NULL,
  num_units_ordered INT UNSIGNED NOT NULL,
  price_at_sale     INT UNSIGNED NOT NULL,
  cost_per_unit     INT UNSIGNED NOT NULL,
  PRIMARY KEY (order_ref, meal_ref),
  KEY idx_ol_meal(meal_ref),
  CONSTRAINT fk_ol_order FOREIGN KEY (order_ref) REFERENCES ORDERS(order_id) ON DELETE CASCADE,
  CONSTRAINT fk_ol_meal FOREIGN KEY (meal_ref)  REFERENCES MEAL(meal_id)    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE ORDER_PROMOTION (
  order_ref       INT UNSIGNED NOT NULL,
  promotion_ref   INT UNSIGNED NOT NULL,
  discount_amount INT UNSIGNED NOT NULL,
  PRIMARY KEY (order_ref, promotion_ref),
  KEY idx_op_promo (promotion_ref),
  CONSTRAINT fk_op_order FOREIGN KEY (order_ref)     REFERENCES ORDERS(order_id)     ON DELETE CASCADE,
  CONSTRAINT fk_op_promo FOREIGN KEY (promotion_ref) REFERENCES PROMOTION(promotion_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE STOCK (
  stock_id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  meal_ref               INT UNSIGNED NOT NULL,
  quantity_in_stock      INT UNSIGNED NOT NULL,
  reorder_threshold      INT UNSIGNED NOT NULL,
  needs_reorder          BOOLEAN NOT NULL,
  last_restock           DATE DEFAULT NULL,
  stock_fulfillment_time TINYINT UNSIGNED NOT NULL,
  created_by             INT UNSIGNED NOT NULL,
  created_at             DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_by             INT UNSIGNED DEFAULT NULL,
  last_updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (stock_id),
  KEY idx_stock_meal_ref(meal_ref),
  KEY idx_stock_created_by(created_by),
  KEY idx_stock_updated_by(updated_by),
  CONSTRAINT fk_stock_meal      FOREIGN KEY (meal_ref) REFERENCES MEAL(meal_id) ON DELETE CASCADE,
  CONSTRAINT fk_stock_createdby FOREIGN KEY (created_by) REFERENCES STAFF(staff_id) ON DELETE RESTRICT,
  CONSTRAINT fk_stock_updatedby FOREIGN KEY (updated_by) REFERENCES STAFF(staff_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE PAYMENT (
  payment_id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_ref          INT UNSIGNED NOT NULL,
  payment_method_ref INT UNSIGNED NOT NULL,
  payment_amount     INT UNSIGNED NOT NULL,
  payment_datetime   DATETIME DEFAULT CURRENT_TIMESTAMP,
  transaction_status TINYINT UNSIGNED NOT NULL,
  created_by         INT UNSIGNED NOT NULL,
  created_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_by         INT UNSIGNED DEFAULT NULL,
  last_updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (payment_id),
  UNIQUE KEY uq_payment_order (order_ref),
  KEY idx_payment_method(payment_method_ref),
  KEY idx_payment_created_by(created_by),
  KEY idx_payment_updated_by(updated_by),
  CONSTRAINT fk_payment_order     FOREIGN KEY (order_ref) REFERENCES ORDERS(order_id) ON DELETE RESTRICT,
  CONSTRAINT fk_payment_method    FOREIGN KEY (payment_method_ref) REFERENCES PAYMENT_METHOD(payment_method_id) ON DELETE RESTRICT,
  CONSTRAINT fk_payment_createdby FOREIGN KEY (created_by) REFERENCES STAFF(staff_id) ON DELETE RESTRICT,
  CONSTRAINT fk_payment_updatedby FOREIGN KEY (updated_by) REFERENCES STAFF(staff_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Added this for the event_outbox.json in the reports
CREATE TABLE EVENT_OUTBOX (
  event_id      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  event_type    VARCHAR(64)     NOT NULL,
  ref_order_id  INT UNSIGNED    NULL,
  payload_json  JSON            NOT NULL,
  published     TINYINT         NOT NULL DEFAULT 0,
  created_at    DATETIME        DEFAULT CURRENT_TIMESTAMP,
  published_at  DATETIME        NULL,
  PRIMARY KEY (event_id),
  KEY idx_type_created   (event_type, created_at),
  KEY idx_ref_order      (ref_order_id),
  CONSTRAINT fk_outbox_order FOREIGN KEY (ref_order_id)
    REFERENCES ORDERS(order_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
