import pool from '../config/database.js';

// Create new meal
export const createMeal = async (req, res) => {
  console.log('Create meal request received:', req.body);
  const connection = await pool.getConnection();

  try {
    let {
      meal_name,
      meal_description,
      img_url,
      meal_status,
      nutrition_facts,
      start_date,
      end_date,
      price,
      cost_to_make,
      meal_types = []
    } = req.body;

    if (typeof nutrition_facts === 'string') {
      try {
        nutrition_facts = JSON.parse(nutrition_facts);
      } catch {
        nutrition_facts = {};
      }
    }

    if (!meal_name || !meal_description || !img_url || meal_status === undefined || !start_date || !end_date || price === undefined || cost_to_make === undefined) {
      return res.status(400).json({
        error: 'Meal name, description, image URL, status, dates, price, and cost are required'
      });
    }

    if (price < 0 || cost_to_make < 0) {
      return res.status(400).json({ error: 'Price and cost must be non-negative' });
    }

    await connection.beginTransaction();

    const staffUserId = req.user.userId;
    const [staff] = await connection.query(
      'SELECT staff_id FROM STAFF WHERE user_ref = ?',
      [staffUserId]
    );

    if (staff.length === 0) {
      await connection.rollback();
      return res.status(403).json({ error: 'Staff user not found' });
    }

    const createdById = staff[0].staff_id;

    const [mealResult] = await connection.query(
      `INSERT INTO MEAL (
        meal_name, meal_description, img_url, meal_status, nutrition_facts,
        start_date, end_date, price, cost_to_make, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        meal_name,
        meal_description,
        img_url,
        meal_status,
        JSON.stringify(nutrition_facts || {}),
        start_date,
        end_date,
        price,
        cost_to_make,
        createdById
      ]
    );

    const mealId = mealResult.insertId;

    const quantity_in_stock = 0;
    const reorder_threshold = 10;
    const needs_reorder = 1;
    const stock_fulfillment_time = 60;

    await connection.query(
      `
      INSERT INTO STOCK (
        meal_ref, quantity_in_stock, reorder_threshold, needs_reorder,
        stock_fulfillment_time, created_at, last_updated_at, created_by
      )
      VALUES (?, ?, ?, ?, ?, NOW(), NOW(), ?)
      `,
      [mealId, quantity_in_stock, reorder_threshold, needs_reorder, stock_fulfillment_time, createdById]
    );

    if (meal_types.length > 0) {
      for (const typeName of meal_types) {
        let [existingType] = await connection.query(
          'SELECT meal_type_id FROM MEAL_TYPE WHERE meal_type = ?',
          [typeName]
        );

        let typeId;
        if (existingType.length === 0) {
          const [typeResult] = await connection.query(
            'INSERT INTO MEAL_TYPE (meal_type) VALUES (?)',
            [typeName]
          );
          typeId = typeResult.insertId;
        } else {
          typeId = existingType[0].meal_type_id;
        }

        await connection.query(
          'INSERT INTO MEAL_TYPE_LINK (meal_ref, meal_type_ref) VALUES (?, ?)',
          [mealId, typeId]
        );
      }
    }

    await connection.commit();

    res.status(201).json({
      message: 'Meal created successfully',
      meal: {
        meal_id: mealId,
        meal_name,
        meal_description,
        img_url,
        meal_status,
        nutrition_facts: nutrition_facts || {},
        start_date,
        end_date,
        price,
        cost_to_make,
        meal_types
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Create meal error:', error);
    res.status(500).json({ error: 'Failed to create meal', details: error.message });
  } finally {
    connection.release();
  }
};

// Get all meals (with stock quantity)
export const getAllMeals = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query(`
      SELECT 
        m.meal_id,
        m.meal_name,
        m.meal_description,
        m.img_url,
        m.meal_status,
        m.start_date,
        m.end_date,
        m.price,
        m.cost_to_make,
        m.nutrition_facts,
        COALESCE(s.quantity_in_stock, 0) AS quantity_in_stock,  
        JSON_ARRAYAGG(mt.meal_type) AS meal_types
      FROM MEAL m
      LEFT JOIN MEAL_TYPE_LINK mtl ON m.meal_id = mtl.meal_ref
      LEFT JOIN MEAL_TYPE mt ON mtl.meal_type_ref = mt.meal_type_id
      LEFT JOIN STOCK s ON m.meal_id = s.meal_ref
      GROUP BY m.meal_id
      ORDER BY m.meal_name ASC
    `);

    const meals = rows.map((meal) => ({
      ...meal,
      meal_types: Array.isArray(meal.meal_types)
        ? meal.meal_types.filter(Boolean)
        : meal.meal_types
        ? [meal.meal_types].filter(Boolean)
        : [],
      nutrition_facts: (() => {
        try {
          return typeof meal.nutrition_facts === 'string'
            ? JSON.parse(meal.nutrition_facts)
            : meal.nutrition_facts || {};
        } catch {
          return {};
        }
      })()
    }));

    res.status(200).json(meals);
  } catch (error) {
    console.error('Error fetching meals:', error);
    res.status(500).json({ error: 'Failed to fetch meals', details: error.message });
  } finally {
    connection.release();
  }
};


// Get meal by ID
export const getMealById = async (req, res) => {
  try {
    const { id } = req.params;

    const [meals] = await pool.query(`
      SELECT
        m.meal_id,
        m.meal_name,
        m.meal_description,
        m.img_url,
        m.meal_status,
        m.nutrition_facts,
        m.start_date,
        m.end_date,
        m.price,
        m.cost_to_make,
        GROUP_CONCAT(mt.meal_type) as meal_types
      FROM MEAL m
      LEFT JOIN MEAL_TYPE_LINK mtl ON m.meal_id = mtl.meal_ref
      LEFT JOIN MEAL_TYPE mt ON mtl.meal_type_ref = mt.meal_type_id
      WHERE m.meal_id = ?
      GROUP BY m.meal_id
    `, [id]);

    if (meals.length === 0) {
      return res.status(404).json({ error: 'Meal not found' });
    }

    const meal = meals[0];

    res.json({
      meal: {
        ...meal,
        meal_types: meal.meal_types ? meal.meal_types.split(',') : [],
        nutrition_facts: (() => {
          try {
            return typeof meal.nutrition_facts === 'string'
              ? JSON.parse(meal.nutrition_facts)
              : meal.nutrition_facts || {};
          } catch {
            return {};
          }
        })()
      },
    });
  } catch (error) {
    console.error('Get meal by ID error:', error);
    res.status(500).json({ error: 'Failed to retrieve meal', details: error.message });
  }
};

// Update meal
export const updateMeal = async (req, res) => {
  console.log('Update meal request received:', { id: req.params.id, ...req.body });
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    let {
      meal_name,
      meal_description,
      img_url,
      meal_status,
      nutrition_facts,
      start_date,
      end_date,
      price,
      cost_to_make,
      meal_types
    } = req.body;

    await connection.beginTransaction();

    const [existingMeals] = await connection.query(
      'SELECT meal_id FROM MEAL WHERE meal_id = ?',
      [id]
    );

    if (existingMeals.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Meal not found' });
    }

    const staffUserId = req.user.userId;
    const [staff] = await connection.query(
      'SELECT staff_id FROM STAFF WHERE user_ref = ?',
      [staffUserId]
    );

    if (staff.length === 0) {
      await connection.rollback();
      return res.status(403).json({ error: 'Staff user not found' });
    }

    const updatedById = staff[0].staff_id;

    if (nutrition_facts && typeof nutrition_facts === 'string') {
      try {
        nutrition_facts = JSON.parse(nutrition_facts);
      } catch {
        nutrition_facts = {};
      }
    }

    const updateFields = [];
    const updateParams = [];

    if (meal_name !== undefined) {
      updateFields.push('meal_name = ?');
      updateParams.push(meal_name);
    }
    if (meal_description !== undefined) {
      updateFields.push('meal_description = ?');
      updateParams.push(meal_description);
    }
    if (img_url !== undefined) {
      updateFields.push('img_url = ?');
      updateParams.push(img_url);
    }
    if (meal_status !== undefined) {
      updateFields.push('meal_status = ?');
      updateParams.push(meal_status);
    }
    if (nutrition_facts !== undefined) {
      updateFields.push('nutrition_facts = ?');
      updateParams.push(JSON.stringify(nutrition_facts));
    }
    if (start_date !== undefined) {
      updateFields.push('start_date = ?');
      updateParams.push(start_date);
    }
    if (end_date !== undefined) {
      updateFields.push('end_date = ?');
      updateParams.push(end_date);
    }
    if (price !== undefined) {
      if (price < 0) {
        await connection.rollback();
        return res.status(400).json({ error: 'Price must be non-negative' });
      }
      updateFields.push('price = ?');
      updateParams.push(price);
    }
    if (cost_to_make !== undefined) {
      if (cost_to_make < 0) {
        await connection.rollback();
        return res.status(400).json({ error: 'Cost must be non-negative' });
      }
      updateFields.push('cost_to_make = ?');
      updateParams.push(cost_to_make);
    }

    if (updateFields.length > 0) {
      updateFields.push('updated_by = ?');
      updateParams.push(updatedById);
      updateParams.push(id);

      await connection.query(
        `UPDATE MEAL SET ${updateFields.join(', ')} WHERE meal_id = ?`,
        updateParams
      );
    }

    if (meal_types !== undefined) {
      await connection.query('DELETE FROM MEAL_TYPE_LINK WHERE meal_ref = ?', [id]);

      for (const typeName of meal_types) {
        let [existingType] = await connection.query(
          'SELECT meal_type_id FROM MEAL_TYPE WHERE meal_type = ?',
          [typeName]
        );

        let typeId;
        if (existingType.length === 0) {
          const [typeResult] = await connection.query(
            'INSERT INTO MEAL_TYPE (meal_type) VALUES (?)',
            [typeName]
          );
          typeId = typeResult.insertId;
        } else {
          typeId = existingType[0].meal_type_id;
        }

        await connection.query(
          'INSERT INTO MEAL_TYPE_LINK (meal_ref, meal_type_ref) VALUES (?, ?)',
          [id, typeId]
        );
      }
    }

    await connection.commit();

    const [updatedMeals] = await pool.query(`
      SELECT
        m.meal_id,
        m.meal_name,
        m.meal_description,
        m.img_url,
        m.meal_status,
        m.nutrition_facts,
        m.start_date,
        m.end_date,
        m.price,
        m.cost_to_make,
        m.created_at,
        m.last_updated_at,
        GROUP_CONCAT(mt.meal_type) as meal_types
      FROM MEAL m
      LEFT JOIN MEAL_TYPE_LINK mtl ON m.meal_id = mtl.meal_ref
      LEFT JOIN MEAL_TYPE mt ON mtl.meal_type_ref = mt.meal_type_id
      WHERE m.meal_id = ?
      GROUP BY m.meal_id
    `, [id]);

    const meal = updatedMeals[0];

    let parsedFacts = {};
    try {
      parsedFacts = typeof meal.nutrition_facts === 'string'
        ? JSON.parse(meal.nutrition_facts)
        : meal.nutrition_facts || {};
    } catch {
      parsedFacts = {};
    }

    res.json({
      message: 'Meal updated successfully',
      meal: {
        ...meal,
        nutrition_facts: parsedFacts,
        meal_types: meal.meal_types ? meal.meal_types.split(',') : []
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Update meal error:', error);
    res.status(500).json({ error: 'Failed to update meal', details: error.message });
  } finally {
    connection.release();
  }
};

// Delete meal
export const deleteMeal = async (req, res) => {
  console.log('Delete meal request received:', { id: req.params.id });
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;

    await connection.beginTransaction();

    const [existingMeals] = await connection.query(
      'SELECT meal_id FROM MEAL WHERE meal_id = ?',
      [id]
    );

    if (existingMeals.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Meal not found' });
    }

    await connection.query('DELETE FROM MEAL_TYPE_LINK WHERE meal_ref = ?', [id]);
    await connection.query('DELETE FROM MEAL WHERE meal_id = ?', [id]);

    await connection.commit();

    res.json({ message: 'Meal deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Delete meal error:', error);
    res.status(500).json({ error: 'Failed to delete meal', details: error.message });
  } finally {
    connection.release();
  }
};
