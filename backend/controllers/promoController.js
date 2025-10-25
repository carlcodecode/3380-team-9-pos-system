import pool from '../config/database.js';

// Create promotion
export const createPromo = async (req, res) => {
  console.log('Create promo request received:', req.body);
  const connection = await pool.getConnection();

  try {
    const { promo_description, promo_type, promo_code, promo_exp_date } = req.body;

    // Validation
    if (!promo_description || promo_type === undefined || !promo_code || !promo_exp_date) {
      return res.status(400).json({
        error: 'All fields are required',
      });
    }

    if (isNaN(Date.parse(promo_exp_date))) {
      return res.status(400).json({ error: 'Expiration date is invalid' });
    }

    await connection.beginTransaction();

    // Get staff_id for created_by
    const staffUserId = req.user.userId;
    const [staff] = await connection.query('SELECT staff_id FROM STAFF WHERE user_ref = ?', [
      staffUserId,
    ]);

    if (staff.length === 0) {
      await connection.rollback();
      return res.status(403).json({ error: 'Staff user not found' });
    }

    const createdById = staff[0].staff_id;

    // Insert into PROMOTION tale
    const [result] = await connection.query(
      `INSERT INTO PROMOTION (
        promo_description, promo_type, promo_code, promo_exp_date, created_by
      ) VALUES (?, ?, ?, ?, ?)`,
      [promo_description, promo_type, promo_code, promo_exp_date, createdById],
    );

    const promoId = result.insertId;

    await connection.commit();

    res.status(201).json({
      message: 'Promotion created successfully',
      promotion: {
        promotion_id: promoId,
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

    res.json({
      promotions: promos,
      count: promos.length,
    });
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

    // Ensure promo existance
    const [existing] = await connection.query(
      'SELECT promotion_id FROM PROMOTION WHERE promotion_id = ?',
      [id],
    );
    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Promotion not found' });
    }

    // Staff updated_by
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

    // Update updated_by
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

    // Return updated row
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

    res.json({
      message: 'Promotion updated successfully',
      promotion: rows[0],
    });
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

    // Ensure exists
    const [existing] = await connection.query(
      'SELECT promotion_id FROM PROMOTION WHERE promotion_id = ?',
      [id],
    );
    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Promotion not found' });
    }

    // Explicit delete
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
