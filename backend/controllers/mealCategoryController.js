import pool from '../config/database.js';

export const getAllMealCategories = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM MEAL_TYPE');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching meal categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMealCategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM MEAL_TYPE WHERE meal_type_id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Meal category not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching meal category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createMealCategory = async (req, res) => {
  const { meal_type } = req.body;

  if (!meal_type) {
    return res.status(400).json({ error: 'meal_type is required' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO MEAL_TYPE (meal_type) VALUES (?)',
      [meal_type]
    );

    res.status(201).json({
      message: 'Meal category created successfully',
      meal_type_id: result.insertId,
    });
  } catch (error) {
    console.error('Error creating meal category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateMealCategory = async (req, res) => {
  const { id } = req.params;
  const { meal_type } = req.body;

  if (!meal_type) {
    return res.status(400).json({ error: 'meal_type is required' });
    }
    
  try {
    const [result] = await pool.query(
      'UPDATE MEAL_TYPE SET meal_type = ? WHERE meal_type_id = ?',
      [meal_type, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Meal category not found' });
    }
    res.json({ message: 'Meal category updated successfully' });
  } catch (error) {
    console.error('Error updating meal category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteMealCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      'DELETE FROM MEAL_TYPE WHERE meal_type_id = ?',
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Meal category not found' });
    }
    res.json({ message: 'Meal category deleted successfully' });
  } catch (error) {
    console.error('Error deleting meal category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default {
  getAllMealCategories,
  getMealCategoryById,
  createMealCategory,
  updateMealCategory,
  deleteMealCategory
};