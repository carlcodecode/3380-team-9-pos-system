USE bento_pos;

-- views all tables
SELECT * FROM USER_ACCOUNT;
SELECT * FROM STAFF;
SELECT * FROM CUSTOMER;
SELECT * FROM MEAL;
SELECT * FROM STOCK;
SELECT * FROM ORDERS;
SELECT * FROM ORDER_LINE;
SELECT * FROM PAYMENT_METHOD;
SELECT * FROM EVENT_OUTBOX;

-- Revenue report
SELECT * FROM v_revenue_by_meal_and_date ORDER BY order_date DESC, revenue_usd DESC;

-- Inventory report
SELECT * FROM v_inventory_status ORDER BY below_threshold DESC, qty_gap_to_threshold DESC;

-- Event outbox (for the trigger, WAS ADDED IN SCHEMA too)
SELECT 
    event_id,
    event_type,
    ref_order_id,
    JSON_EXTRACT(payload_json, '$.tracking_number') AS tracking_number,
    JSON_EXTRACT(payload_json, '$.customer_ref')    AS customer_ref,
    JSON_EXTRACT(payload_json, '$.quantity_in_stock') AS qty_stock,
    created_at
FROM EVENT_OUTBOX
ORDER BY event_id DESC;

-- Orders + lineorder
SELECT 
    o.order_id,
    o.order_date,
    o.order_status,
    o.tracking_number,
    ol.meal_ref,
    ol.num_units_ordered,
    ol.price_at_sale
FROM ORDERS o
JOIN ORDER_LINE ol ON o.order_id = ol.order_ref
ORDER BY o.order_id;

-- Meals in stock
SELECT 
    m.meal_id, 
    m.meal_name,
    s.quantity_in_stock,
    s.needs_reorder
FROM MEAL m
JOIN STOCK s ON s.meal_ref = m.meal_id;
