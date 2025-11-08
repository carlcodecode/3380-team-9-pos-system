import pool from '../config/database.js';

/**
 * Helper: compute revenue expression using ORDERS schema.
 * Assumes unit_price, tax, discount are integer cents.
 * Revenue = unit_price + tax - COALESCE(discount, 0)
 */
const REVENUE_EXPR = '(o.unit_price + o.tax - COALESCE(o.discount, 0))';

// Create promotion
export const createPromo = async (req, res) => {
  console.log('Create promo request received:', req.body);
  const connection = await pool.getConnection();

  try {
    const { promo_description, promo_type, promo_code, promo_exp_date } = req.body;

    if (!promo_description || promo_type === undefined || !promo_code || !promo_exp_date) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (isNaN(Date.parse(promo_exp_date))) {
      return res.status(400).json({ error: 'Expiration date is invalid' });
    }

    await connection.beginTransaction();

    const staffUserId = req.user.userId;
    const [staff] = await connection.query('SELECT staff_id FROM STAFF WHERE user_ref = ?', [
      staffUserId,
    ]);

    if (staff.length === 0) {
      await connection.rollback();
      return res.status(403).json({ error: 'Staff user not found' });
    }

    const createdById = staff[0].staff_id;

    const [result] = await connection.query(
      `INSERT INTO PROMOTION (
        promo_description, promo_type, promo_code, promo_exp_date, created_by
      ) VALUES (?, ?, ?, ?, ?)`,
      [promo_description, promo_type, promo_code, promo_exp_date, createdById],
    );

    await connection.commit();

    res.status(201).json({
      message: 'Promotion created successfully',
      promotion: {
        promotion_id: result.insertId,
        promo_description,
        promo_type,
        promo_code,
        promo_exp_date,
        created_by: createdById,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create promotion error:', error);
    res.status(500).json({ error: 'Failed to create promotion', details: error.message });
  } finally {
    connection.release();
  }
};

// Get all promotions
export const getAllPromos = async (req, res) => {
  try {
    const [promos] = await pool.query(`
      SELECT
        p.promotion_id,
        p.promo_description,
        p.promo_type,
        p.promo_code,
        p.promo_exp_date,
        p.created_by,
        p.updated_by,
        p.created_at,
        p.last_updated_at
      FROM PROMOTION p
      ORDER BY p.promotion_id
    `);

    res.json({ promotions: promos, count: promos.length });
  } catch (error) {
    console.error('Get all promotions error:', error);
    res.status(500).json({ error: 'Failed to retrieve promotions', details: error.message });
  }
};

// Get promotion by ID
export const getPromoById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT
        p.promotion_id,
        p.promo_description,
        p.promo_type,
        p.promo_code,
        p.promo_exp_date,
        p.created_by,
        p.updated_by,
        p.created_at,
        p.last_updated_at
      FROM PROMOTION p
      WHERE p.promotion_id = ?
      `,
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Promotion not found' });
    }

    res.json({ promotion: rows[0] });
  } catch (error) {
    console.error('Get promotion by ID error:', error);
    res.status(500).json({ error: 'Failed to retrieve promotion', details: error.message });
  }
};

// Update promotion
export const updatePromo = async (req, res) => {
  console.log('Update promo request received:', { id: req.params.id, ...req.body });
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const { promo_description, promo_type, promo_code, promo_exp_date } = req.body;

    await connection.beginTransaction();

    const [existing] = await connection.query(
      'SELECT promotion_id FROM PROMOTION WHERE promotion_id = ?',
      [id],
    );
    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Promotion not found' });
    }

    const staffUserId = req.user.userId;
    const [staff] = await connection.query('SELECT staff_id FROM STAFF WHERE user_ref = ?', [
      staffUserId,
    ]);
    if (staff.length === 0) {
      await connection.rollback();
      return res.status(403).json({ error: 'Staff user not found' });
    }
    const updatedById = staff[0].staff_id;

    const fields = [];
    const params = [];

    if (promo_description !== undefined) {
      fields.push('promo_description = ?');
      params.push(promo_description);
    }
    if (promo_type !== undefined) {
      if (!Number.isInteger(promo_type) || promo_type < 0) {
        await connection.rollback();
        return res.status(400).json({ error: 'promo_type must be a non-negative integer' });
      }
      fields.push('promo_type = ?');
      params.push(promo_type);
    }
    if (promo_code !== undefined) {
      fields.push('promo_code = ?');
      params.push(promo_code);
    }
    if (promo_exp_date !== undefined) {
      if (isNaN(Date.parse(promo_exp_date))) {
        await connection.rollback();
        return res.status(400).json({ error: 'promo_exp_date must be a valid date (YYYY-MM-DD)' });
      }
      fields.push('promo_exp_date = ?');
      params.push(promo_exp_date);
    }

    fields.push('updated_by = ?');
    params.push(updatedById);

    if (fields.length > 0) {
      params.push(id);
      await connection.query(
        `UPDATE PROMOTION SET ${fields.join(', ')} WHERE promotion_id = ?`,
        params,
      );
    }

    await connection.commit();

    const [rows] = await pool.query(
      `
      SELECT
        promotion_id, promo_description, promo_type, promo_code, promo_exp_date,
        created_by, updated_by, created_at, last_updated_at
      FROM PROMOTION
      WHERE promotion_id = ?
      `,
      [id],
    );

    res.json({ message: 'Promotion updated successfully', promotion: rows[0] });
  } catch (error) {
    await connection.rollback();
    console.error('Update promotion error:', error);
    res.status(500).json({ error: 'Failed to update promotion', details: error.message });
  } finally {
    connection.release();
  }
};

// Delete promotion
export const deletePromo = async (req, res) => {
  console.log('Delete promo request received:', { id: req.params.id });
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;

    await connection.beginTransaction();

    const [existing] = await connection.query(
      'SELECT promotion_id FROM PROMOTION WHERE promotion_id = ?',
      [id],
    );
    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Promotion not found' });
    }

    await connection.query('DELETE FROM PROMOTION WHERE promotion_id = ?', [id]);

    await connection.commit();

    res.json({ message: 'Promotion deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Delete promotion error:', error);
    res.status(500).json({ error: 'Failed to delete promotion', details: error.message });
  } finally {
    connection.release();
  }
};

// Validate promo code
export const validatePromoCode = async (req, res) => {
  try {
    const { code } = req.params;

    if (!code) {
      return res.status(400).json({ error: 'Promo code is required' });
    }

    const [promos] = await pool.query(
      `SELECT
        promotion_id,
        promo_description,
        promo_type,
        promo_code,
        promo_exp_date,
        created_at
      FROM PROMOTION
      WHERE promo_code = ?`,
      [code.toUpperCase()],
    );

    if (promos.length === 0) {
      return res.status(404).json({ error: 'Invalid promo code' });
    }

    const promo = promos[0];

    if (promo.promo_exp_date) {
      const expiryDate = new Date(promo.promo_exp_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (expiryDate < today) {
        return res.status(400).json({ error: 'Promo code has expired' });
      }
    }

    res.json({
      valid: true,
      promotion: {
        id: promo.promotion_id,
        description: promo.promo_description,
        type: promo.promo_type,
        code: promo.promo_code,
        expiryDate: promo.promo_exp_date,
      },
    });
  } catch (error) {
    console.error('Validate promo code error:', error);
    res.status(500).json({ error: 'Failed to validate promo code', details: error.message });
  }
};

// Get promotion analytics
export const getPromoAnalytics = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    // Validate date parameters
    if (!start_date || !end_date) {
      return res.status(400).json({
        error: 'Both start_date and end_date are required',
      });
    }

    if (isNaN(Date.parse(start_date)) || isNaN(Date.parse(end_date))) {
      return res.status(400).json({
        error: 'Invalid date format. Use YYYY-MM-DD',
      });
    }

    // MAIN ANALYTICS QUERY (PROMOTION + ORDER_PROMOTION + ORDERS + CUSTOMER)
    const [promoStats] = await pool.query(
      `SELECT 
        p.promotion_id,
        p.promo_code,
        p.promo_description,
        p.promo_type,
        p.promo_exp_date,
        p.created_at,
        COUNT(DISTINCT op.order_ref) AS total_uses,
        COUNT(DISTINCT o.customer_ref) AS unique_customers,
        COALESCE(SUM(${REVENUE_EXPR}), 0) AS total_revenue,
        COALESCE(AVG(${REVENUE_EXPR}), 0) AS avg_order_value,
        MIN(o.order_date) AS first_use_date,
        MAX(o.order_date) AS last_use_date
      FROM PROMOTION p
      LEFT JOIN ORDER_PROMOTION op
        ON p.promotion_id = op.promotion_ref
      LEFT JOIN \`ORDERS\` o
        ON op.order_ref = o.order_id
        AND o.order_date BETWEEN ? AND ?
      LEFT JOIN CUSTOMER c
        ON o.customer_ref = c.customer_id
      GROUP BY
        p.promotion_id,
        p.promo_code,
        p.promo_description,
        p.promo_type,
        p.promo_exp_date,
        p.created_at
      ORDER BY total_uses DESC`,
      [start_date, end_date],
    );

    // DAILY USAGE TREND
    const [dailyTrend] = await pool.query(
      `SELECT 
        o.order_date AS date,
        COUNT(DISTINCT op.order_ref) AS uses,
        COUNT(DISTINCT o.customer_ref) AS customers,
        COALESCE(SUM(${REVENUE_EXPR}), 0) AS revenue
      FROM \`ORDERS\` o
      INNER JOIN ORDER_PROMOTION op
        ON o.order_id = op.order_ref
      LEFT JOIN CUSTOMER c
        ON o.customer_ref = c.customer_id
      WHERE o.order_date BETWEEN ? AND ?
      GROUP BY o.order_date
      ORDER BY o.order_date`,
      [start_date, end_date],
    );

    // TOP PERFORMING PROMOTIONS
    const [topPromos] = await pool.query(
      `SELECT 
        p.promotion_id,
        p.promo_code,
        p.promo_description,
        COUNT(DISTINCT op.order_ref) AS total_uses,
        COALESCE(SUM(${REVENUE_EXPR}), 0) AS total_revenue,
        COUNT(DISTINCT o.customer_ref) AS unique_customers
      FROM PROMOTION p
      INNER JOIN ORDER_PROMOTION op
        ON p.promotion_id = op.promotion_ref
      INNER JOIN \`ORDERS\` o
        ON op.order_ref = o.order_id
      WHERE o.order_date BETWEEN ? AND ?
      GROUP BY
        p.promotion_id,
        p.promo_code,
        p.promo_description
      ORDER BY total_revenue DESC
      LIMIT 10`,
      [start_date, end_date],
    );

    // PROMOTION TYPE BREAKDOWN
    const [typeBreakdown] = await pool.query(
      `SELECT 
        p.promo_type,
        COUNT(DISTINCT p.promotion_id) AS promo_count,
        COUNT(DISTINCT op.order_ref) AS total_uses,
        COALESCE(SUM(${REVENUE_EXPR}), 0) AS total_revenue,
        COUNT(DISTINCT o.customer_ref) AS unique_customers
      FROM PROMOTION p
      LEFT JOIN ORDER_PROMOTION op
        ON p.promotion_id = op.promotion_ref
      LEFT JOIN \`ORDERS\` o
        ON op.order_ref = o.order_id
        AND o.order_date BETWEEN ? AND ?
      LEFT JOIN CUSTOMER c
        ON o.customer_ref = c.customer_id
      GROUP BY p.promo_type
      ORDER BY p.promo_type`,
      [start_date, end_date],
    );

    // CUSTOMER DEMOGRAPHICS / BEHAVIOR
    const [customerDemographics] = await pool.query(
      `SELECT 
        COUNT(DISTINCT c.customer_id) AS total_promo_users,
        COUNT(DISTINCT o.order_id) AS total_orders_with_promos,
        COALESCE(AVG(orders_per_customer.order_count), 0) AS avg_orders_per_customer,
        COALESCE(SUM(${REVENUE_EXPR}), 0) AS total_customer_spending
      FROM CUSTOMER c
      INNER JOIN \`ORDERS\` o
        ON c.customer_id = o.customer_ref
      INNER JOIN ORDER_PROMOTION op
        ON o.order_id = op.order_ref
      LEFT JOIN (
        SELECT
          customer_ref,
          COUNT(*) AS order_count
        FROM \`ORDERS\`
        WHERE order_date BETWEEN ? AND ?
        GROUP BY customer_ref
      ) orders_per_customer
        ON c.customer_id = orders_per_customer.customer_ref
      WHERE o.order_date BETWEEN ? AND ?`,
      [start_date, end_date, start_date, end_date],
    );

    // SUMMARY
    const totalPromotions = promoStats.length;
    const activePromotions = promoStats.filter((p) => Number(p.total_uses) > 0).length;
    const totalUses = promoStats.reduce((sum, p) => sum + Number(p.total_uses || 0), 0);
    const totalRevenue = promoStats.reduce((sum, p) => sum + Number(p.total_revenue || 0), 0);

    const summary = {
      total_promotions: totalPromotions,
      active_promotions: activePromotions,
      total_uses: totalUses,
      total_revenue: totalRevenue,
      // use max per-promo unique_customers as a safe aggregate proxy
      unique_customers:
        promoStats.length > 0
          ? promoStats.reduce((max, p) => Math.max(max, Number(p.unique_customers || 0)), 0)
          : 0,
      avg_revenue_per_use: totalUses > 0 ? totalRevenue / totalUses : 0,
    };

    res.json({
      summary,
      promotions: promoStats.map((p) => ({
        ...p,
        total_uses: Number(p.total_uses || 0),
        unique_customers: Number(p.unique_customers || 0),
        total_revenue: Number(p.total_revenue || 0),
        avg_order_value: Number(p.avg_order_value || 0),
      })),
      daily_trend: dailyTrend.map((d) => ({
        ...d,
        uses: Number(d.uses || 0),
        customers: Number(d.customers || 0),
        revenue: Number(d.revenue || 0),
      })),
      top_promotions: topPromos.map((p) => ({
        ...p,
        total_uses: Number(p.total_uses || 0),
        total_revenue: Number(p.total_revenue || 0),
        unique_customers: Number(p.unique_customers || 0),
      })),
      type_breakdown: typeBreakdown.map((t) => ({
        ...t,
        promo_count: Number(t.promo_count || 0),
        total_uses: Number(t.total_uses || 0),
        total_revenue: Number(t.total_revenue || 0),
        unique_customers: Number(t.unique_customers || 0),
      })),
      customer_demographics: customerDemographics[0]
        ? {
            total_promo_users: Number(customerDemographics[0].total_promo_users || 0),
            total_orders_with_promos: Number(customerDemographics[0].total_orders_with_promos || 0),
            avg_orders_per_customer:
              Number(customerDemographics[0].avg_orders_per_customer || 0) || 0,
            total_customer_spending: Number(customerDemographics[0].total_customer_spending || 0),
          }
        : null,
    });
  } catch (error) {
    console.error('Get promo analytics error:', error);
    res.status(500).json({
      error: 'Failed to retrieve promotion analytics',
      details: error.message,
    });
  }
};
