import pool from './config/database.js';

const query = `
SELECT 
    ol.meal_ref as meal_id, 
    m.meal_name, 
    SUM(ol.num_units_ordered) as total_quantity_sold, 
    SUM(ol.price_at_sale * ol.num_units_ordered) as total_revenue, 
    ROUND(AVG(ol.price_at_sale)) as average_price 
FROM ORDER_LINE ol 
JOIN ORDERS o ON ol.order_ref = o.order_id 
JOIN MEAL m ON ol.meal_ref = m.meal_id 
WHERE o.order_status != 3 
AND o.order_date >= '2025-10-01' 
AND o.order_date <= '2025-10-27' 
GROUP BY ol.meal_ref, m.meal_name 
ORDER BY total_revenue DESC 
LIMIT 10
`;

pool.query(query)
  .then(([rows]) => {
    console.log('Results:', JSON.stringify(rows, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  });
