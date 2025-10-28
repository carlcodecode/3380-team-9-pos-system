import pool from '../config/database.js';

// formatAlerts so alerts is re-usable for both triggers
const formatAlerts = (rows) => {
  return rows.map((row) => {
    try {
      const payload =
        typeof row.payload_json === 'string'
          ? JSON.parse(row.payload_json)
          : row.payload_json || {};

      return {
        event_id: row.event_id,
        event_type: row.event_type,
        created_at: row.created_at,
        meal_name: row.meal_name,
        ref_order_id: row.ref_order_id,
        resolved: !!row.resolved,
        ...payload,
      };
    } catch (e) {
      console.error('Error parsing payload for row:', row.event_id, e);
      return {
        event_id: row.event_id,
        event_type: row.event_type,
        created_at: row.created_at,
        meal_name: row.meal_name,
        ref_order_id: row.ref_order_id,
        resolved: !!row.resolved,
      };
    }
  });
};

// Delivery alerts
export const getDeliveryAlerts = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        event_id,
        event_type,
        payload_json,
        created_at,
        resolved,
        ref_order_id
      FROM EVENT_OUTBOX
      WHERE event_type IN ('ORDER_SHIPPED', 'ORDER_DELIVERED')
        AND (resolved = 0 OR resolved IS NULL)
      ORDER BY created_at DESC
    `);

    return res.json(formatAlerts(rows));
  } catch (error) {
    console.error('Error fetching delivery alerts:', error);
    return res.status(500).json({ error: 'Failed to fetch delivery alerts' });
  }
};


// Changed for compatibility with formatAlerts
export const getLowStockAlerts = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        e.event_id,
        e.event_type,
        e.payload_json,
        e.created_at,
        e.resolved,
        e.ref_order_id,
        m.meal_name
      FROM EVENT_OUTBOX e
      LEFT JOIN MEAL m 
        ON CAST(JSON_UNQUOTE(JSON_EXTRACT(e.payload_json, '$.meal_ref')) AS UNSIGNED) = m.meal_id
      WHERE e.event_type = 'INVENTORY_RESTOCK_NEEDED'
        AND (e.resolved = 0 OR e.resolved IS NULL)
      ORDER BY e.created_at DESC
    `);

    return res.json(formatAlerts(rows));
  } catch (error) {
    console.error('Error fetching low stock alerts:', error);
    return res.status(500).json({ error: 'Failed to fetch low stock alerts' });
  }
};

export const markAlertResolved = async (req, res) => {
  try {
    const { eventId } = req.params;
    console.log("🟡 markAlertResolved called with eventId:", eventId);

    const [result] = await pool.query(
      `UPDATE EVENT_OUTBOX 
       SET resolved = 1, resolved_at = NOW()
       WHERE event_id = ?`,
      [eventId],
    );

    console.log("🟢 Update result:", result);

    if (result.affectedRows === 0) {
      console.warn("⚠️ No rows updated for event_id:", eventId);
      return res.status(404).json({ error: 'Alert not found' });
    }

    return res.json({ success: true, message: 'Alert marked as resolved' });
  } catch (error) {
    console.error('🔴 Error resolving alert:', error);
    return res.status(500).json({ error: 'Failed to resolve alert' });
  }
};


export const getCustomerDeliveryAlerts = async (req, res) => {
  try {
    const { customerId } = req.params;

    const [rows] = await pool.query(`
      SELECT 
        e.event_id,
        e.event_type,
        e.payload_json,
        e.created_at,
        e.resolved,
        e.ref_order_id
      FROM EVENT_OUTBOX e
      JOIN ORDERS o ON e.ref_order_id = o.order_id
      WHERE o.customer_ref = ?
        AND e.event_type IN ('ORDER_SHIPPED', 'ORDER_DELIVERED')
        AND (e.resolved = 0 OR e.resolved IS NULL)
      ORDER BY e.created_at DESC
    `, [customerId]);

    return res.json(formatAlerts(rows));
  } catch (error) {
    console.error('Error fetching customer delivery alerts:', error);
    return res.status(500).json({ error: 'Failed to fetch customer delivery alerts' });
  }
};

