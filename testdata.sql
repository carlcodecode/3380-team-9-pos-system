USE bento_pos;

-- Minimal TEST DATA — NOT real production data

-- USER accounts (2: Manager/Staff + 1: Customer)
INSERT INTO USER_ACCOUNT (username, user_password, email, user_role)
VALUES
('manager1', 'hash1', 'manager@pos.com', 99),
('chefjoe', 'hash2', 'chef@pos.com', 10),
('john', 'hash3', 'john@customer.com', 1);

-- STAFF (Manager creates chef)
INSERT INTO STAFF (user_ref, first_name, last_name, phone_number, hire_date, salary, created_by)
VALUES
(1, 'Alice', 'Boss', '555-1111', '2023-01-01', 7000000, 1),
(2, 'Joe', 'Cook', '555-2222', '2023-06-15', 5000000, 1);

-- CUSTOMER
INSERT INTO CUSTOMER (user_ref, first_name, last_name, city)
VALUES
(3, 'John', 'Doe', 'Houston');

-- Create 2 meals
INSERT INTO MEAL (meal_name, meal_description, meal_status, nutrition_facts,
                  start_date, end_date, created_by, price, cost_to_make)
VALUES
('Spicy Chicken Bento', 'Hot + Delicious', 1, '{"cal":650}', '2023-01-01', '2026-01-01', 1, 1200, 600),
('Veggie Bento', 'Healthy choice', 1, '{"cal":450}', '2023-01-01', '2026-01-01', 1, 900, 400);

-- STOCK for both meals (chef updates)
INSERT INTO STOCK (meal_ref, quantity_in_stock, reorder_threshold, needs_reorder,
                   stock_fulfillment_time, created_by)
VALUES
(1, 50, 10, 0, 3, 2),
(2, 5, 10, 1, 3, 2);

-- Create 1 order from customer (staff creates order)
INSERT INTO ORDERS (customer_ref, order_date, order_status, unit_price, tax, discount,
                    created_by)
VALUES
(1, CURDATE(), 0, 0, 100, 0, 1);  -- Will be updated after order_line calc

SET @order1 = LAST_INSERT_ID();

-- Add order lines
INSERT INTO ORDER_LINE (order_ref, meal_ref, num_units_ordered, price_at_sale, cost_per_unit)
VALUES
(@order1, 1, 2, 1200, 600),
(@order1, 2, 1, 900, 400);

-- Update order totals based on lines
UPDATE ORDERS
SET unit_price = (
    SELECT SUM(num_units_ordered * price_at_sale)
    FROM ORDER_LINE WHERE order_ref = @order1
)
WHERE order_id = @order1;

-- Trigger TEST: Mark shipped → Insert EVENT_OUTBOX rows
UPDATE ORDERS SET order_status = 2, tracking_number = 'TRACK123'
WHERE order_id = @order1;

-- Trigger TEST: Mark delivered → Insert EVENT_OUTBOX row
UPDATE ORDERS SET order_status = 3
WHERE order_id = @order1;

-- Trigger TEST: Make STOCK drop below threshold → reorder alert event
UPDATE STOCK SET quantity_in_stock = 8 WHERE stock_id = 1;  -- only meal1
