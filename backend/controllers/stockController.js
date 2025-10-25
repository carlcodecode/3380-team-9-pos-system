import pool from '../config/database.js';

export const getAllStocks = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.*, m.meal_name 
      FROM STOCK s 
      JOIN MEAL m ON s.meal_ref = m.meal_id
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching stocks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStockById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `
      SELECT s.*, m.meal_name 
      FROM STOCK s 
      JOIN MEAL m ON s.meal_ref = m.meal_id 
      WHERE s.stock_id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Stock item not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching stock:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateStock = async (req, res) => {
  const { id } = req.params;
  const { quantity_in_stock, reorder_threshold, stock_fulfillment_time } = req.body;

  if (quantity_in_stock == null || reorder_threshold == null || stock_fulfillment_time == null) {
    return res.status(400).json({
      error: 'quantity_in_stock, reorder_threshold, and stock_fulfillment_time are required',
    });
  }

  try {
    const needs_reorder = quantity_in_stock <= reorder_threshold ? 1 : 0;

    const [result] = await pool.query(
      `
      UPDATE STOCK 
      SET quantity_in_stock = ?, 
          reorder_threshold = ?, 
          stock_fulfillment_time = ?, 
          needs_reorder = ?, 
          last_updated_at = NOW() 
      WHERE stock_id = ?
      `,
      [quantity_in_stock, reorder_threshold, stock_fulfillment_time, needs_reorder, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Stock item not found' });
    }

    res.json({ message: 'Stock updated successfully' });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
