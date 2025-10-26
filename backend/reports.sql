USE bento_pos;

--
-- Revenue view
--

DROP VIEW IF EXISTS v_revenue_by_meal_and_date;
CREATE VIEW v_revenue_by_meal_and_date AS
SELECT
    o.order_date,
    m.meal_id,
    m.meal_name,
    
    SUM(ol.num_units_ordered)                                 AS units_sold,
    SUM(ol.price_at_sale * ol.num_units_ordered)              AS revenue_cents,
    ROUND(SUM(ol.price_at_sale * ol.num_units_ordered)/100,2) AS revenue_usd

FROM ORDER_LINE ol
JOIN ORDERS o ON ol.order_ref = o.order_id
JOIN MEAL m   ON m.meal_id  = ol.meal_ref
GROUP BY
	o.order_date,
    m.meal_id,
    m.meal_name
ORDER BY
    o.order_date DESC,
    revenue_cents DESC;
    
--
-- Inventory status
--

DROP VIEW IF EXISTS v_inventory_status;
CREATE VIEW v_inventory_status AS
SELECT
    s.stock_id,
    m.meal_id,
    m.meal_name,
    s.quantity_in_stock,
    s.reorder_threshold,
    s.needs_reorder,
    CASE WHEN s.quantity_in_stock <= s.reorder_threshold THEN 1 ELSE 0 END AS below_threshold,
    (s.reorder_threshold - s.quantity_in_stock) AS qty_gap_to_threshold,
    s.last_restock,
    DATEDIFF(CURRENT_DATE, s.last_restock) AS days_since_restock
FROM STOCK s
JOIN MEAL  m ON m.meal_id = s.meal_ref
ORDER BY below_threshold DESC, qty_gap_to_threshold DESC, m.meal_name;


--
-- Staff activity views
--

DROP VIEW IF EXISTS v_staff_activity;
CREATE VIEW v_staff_activity AS
-- Meals created
SELECT
  s.staff_id,
  s.first_name,
  s.last_name,
  'CREATED'              AS activity_type,
  m.meal_id,
  m.meal_name,
  m.meal_description,
  m.meal_status,
  m.price                AS price_cents,
  m.cost_to_make         AS cost_cents,
  m.created_at           AS activity_timestamp
FROM STAFF s
LEFT JOIN MEAL m
  ON m.created_by = s.staff_id

UNION ALL

-- Meals updated
SELECT
  s.staff_id,
  s.first_name,
  s.last_name,
  'UPDATED'              AS activity_type,
  m.meal_id,
  m.meal_name,
  m.meal_description,
  m.meal_status,
  m.price                AS price_cents,
  m.cost_to_make         AS cost_cents,
  m.last_updated_at      AS activity_timestamp
FROM STAFF s
LEFT JOIN MEAL m
  ON m.updated_by = s.staff_id;
