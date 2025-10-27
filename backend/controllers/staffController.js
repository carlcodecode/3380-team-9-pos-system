import pool from '../config/database.js';

const PERMISSIONS = { REPORT: 1 << 0 };
const hasBit = (mask, bit) => ((mask >>> 0) & bit) === bit;

async function getMyStaffRow(userId) {
  const [rows] = await pool.query('SELECT staff_id, PERMISSIONS FROM STAFF WHERE user_ref = ?', [
    userId,
  ]);
  return rows[0] || null;
}

// POST /api/staff/reports/revenue
export const createRevenueReport = async (req, res) => {
  try {
    const role = req.user?.role; // 'staff' | 'admin'
    const userId = req.user?.userId;

    const me = await getMyStaffRow(userId);
    if (role !== 'admin') {
      if (!me) return res.json({ error: 'Not a staff user' }, 403);
      if (!hasBit(me.PERMISSIONS, PERMISSIONS.REPORT)) {
        return res.json({ error: 'Insufficient permissions (REPORT)' }, 403);
      }
    }

    let { start_date, end_date, meal_id, limit, offset } = req.body || {};

    // No timeframe = generates for last 30 days
    if (!start_date || !end_date) {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 30);
      start_date = start.toISOString().slice(0, 10); // YYYY-MM-DD
      end_date = end.toISOString().slice(0, 10);
    }

    const lim = Math.min(parseInt(limit ?? 500, 10) || 500, 5000);
    const off = parseInt(offset ?? 0, 10) || 0;

    let sql = `
      SELECT order_date, meal_id, meal_name, units_sold, revenue_cents, revenue_usd
      FROM v_revenue_by_meal_and_date
      WHERE order_date >= ? AND order_date <= ?
    `;
    const params = [start_date, end_date];

    if (meal_id) {
      sql += ' AND meal_id = ?';
      params.push(parseInt(meal_id, 10));
    }

    sql += ' ORDER BY order_date DESC, revenue_cents DESC LIMIT ? OFFSET ?';
    params.push(lim, off);

    const [rows] = await pool.query(sql, params);

    // Totals for report
    const totals = rows.reduce(
      (acc, r) => {
        acc.units += Number(r.units_sold || 0);
        acc.cents += Number(r.revenue_cents || 0);
        return acc;
      },
      { units: 0, cents: 0 },
    );

    return res.json({
      report: 'revenue_by_meal_and_date',
      filters: { start_date, end_date, meal_id: meal_id ?? null, limit: lim, offset: off },
      totals: {
        units_sold: totals.units,
        revenue_cents: totals.cents,
        revenue_usd: +(totals.cents / 100).toFixed(2),
      },
      count: rows.length,
      data: rows,
    });
  } catch (err) {
    console.error('createRevenueReport error:', err);
    return res.json({ error: 'Failed to create revenue report', details: err.message }, 500);
  }
};
