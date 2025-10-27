import pool from '../config/database.js';
import { URL } from 'url';

const PERMISSIONS = { REPORT: 1 << 0 };
const hasBit = (mask, bit) => ((mask >>> 0) & bit) === bit;

async function getMyStaffRow(userId) {
  const [rows] = await pool.query('SELECT staff_id, PERMISSIONS FROM STAFF WHERE user_ref = ?', [
    userId,
  ]);
  return rows[0] || null;
}

// Helper: get ?format= from URL or body
function getFormat(req, forcedFormat) {
  if (forcedFormat) return forcedFormat.toLowerCase();
  try {
    const u = new URL(req.url, 'http://localhost');
    const q = (u.searchParams.get('format') || req.body?.format || 'json').toLowerCase();
    return q;
  } catch {
    return (req.body?.format || 'json').toLowerCase();
  }
}

// POST /api/staff/reports/revenue  (JSON default)
// POST /api/staff/reports/revenue.csv  (CSV)
export const createRevenueReport = async (req, res, forcedFormat) => {
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

    // Default to last 30 days if no range
    if (!start_date || !end_date) {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 30);
      start_date = start.toISOString().slice(0, 10);
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

    const totals = rows.reduce(
      (acc, r) => {
        acc.units += Number(r.units_sold || 0);
        acc.cents += Number(r.revenue_cents || 0);
        return acc;
      },
      { units: 0, cents: 0 },
    );

    const fmt = getFormat(req, forcedFormat);

    if (fmt === 'csv') {
      const headers = [
        'order_date',
        'meal_id',
        'meal_name',
        'units_sold',
        'revenue_cents',
        'revenue_usd',
      ];
      const headerLine = headers.join(',') + '\n';
      const bodyLines = rows
        .map((r) =>
          [
            r.order_date ?? '',
            r.meal_id ?? '',
            JSON.stringify(r.meal_name ?? ''),
            r.units_sold ?? 0,
            r.revenue_cents ?? 0,
            r.revenue_usd ?? 0,
          ].join(','),
        )
        .join('\n');

      // Optional totals row at end:
      const totalsLine = [
        'TOTALS',
        '',
        '',
        totals.units,
        totals.cents,
        (totals.cents / 100).toFixed(2),
      ].join(',');

      const csv = `${headerLine}${bodyLines}\n${totalsLine}\n`;
      const filename = `revenue-${start_date}_${end_date}.csv`;

      res.status(200);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Cache-Control', 'no-store');
      res.end(csv);
      return;
    }

    // Default JSON (for “View” page)
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
