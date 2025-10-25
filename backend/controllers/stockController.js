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


export const updateStockSettings = async (req, res) => {
  const { id } = req.params;
  const { reorder_threshold, stock_fulfillment_time, max_stock } = req.body;

  if (
    reorder_threshold == null ||
    stock_fulfillment_time == null ||
    max_stock == null
  ) {
    return res.status(400).json({
      error: 'reorder_threshold, stock_fulfillment_time, and max_stock are required',
    });
  }

  try {
    const [result] = await pool.query(
      `
      UPDATE STOCK
      SET reorder_threshold = ?, 
          stock_fulfillment_time = ?, 
          max_stock = ?, 
          last_updated_at = NOW()
      WHERE stock_id = ?
      `,
      [reorder_threshold, stock_fulfillment_time, max_stock, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Stock item not found' });
    }

    res.json({ message: 'Stock settings updated successfully' });
  } catch (error) {
    console.error('Error updating stock settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const restockMeal = async (req, res) => {
  const { id } = req.params;
  const { quantity_to_add } = req.body;

  if (quantity_to_add == null || quantity_to_add <= 0) {
    return res.status(400).json({ error: 'Quantity to add must be positive' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
      SELECT s.*, m.cost_to_make 
      FROM STOCK s
      JOIN MEAL m ON s.meal_ref = m.meal_id
      WHERE s.stock_id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Stock item not found' });
    }

    const stock = rows[0];
    const newQuantity = stock.quantity_in_stock + quantity_to_add;

    if (newQuantity > stock.max_stock) {
      await connection.rollback();
      return res.status(400).json({
        error: `Cannot exceed max stock (${stock.max_stock}). Current: ${stock.quantity_in_stock}`,
      });
    }

    const additionalCost = stock.cost_to_make * quantity_to_add;
    const needs_reorder = newQuantity <= stock.reorder_threshold ? 1 : 0;

    await connection.query(
      `
      UPDATE STOCK
      SET quantity_in_stock = ?, 
          needs_reorder = ?, 
          last_restock = NOW(), 
          total_spent = total_spent + ?, 
          last_updated_at = NOW()
      WHERE stock_id = ?
      `,
      [newQuantity, needs_reorder, additionalCost, id]
    );

    await connection.commit();

    res.json({
      message: `Restock successful. Added ${quantity_to_add} units.`,
      data: { newQuantity, additionalCost },
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error restocking meal:', error);
    res.status(500).json({ error: 'Failed to restock' });
  } finally {
    connection.release();
  }
};

