import pool from '../config/database.js';

// Create new meal
export const createMeal = async (req, res) => {
	console.log('Create meal request received:', req.body);
	const connection = await pool.getConnection();

	try {
		const {
			meal_name,
			meal_description,
			meal_status,
			nutrition_facts,
			start_date,
			end_date,
			price,
			cost_to_make,
			meal_types = []
		} = req.body;

		// Validation
		if (!meal_name || !meal_description || meal_status === undefined || !start_date || !end_date || price === undefined || cost_to_make === undefined) {
			return res.status(400).json({
				error: 'Meal name, description, status, dates, price, and cost are required'
			});
		}

		if (price < 0 || cost_to_make < 0) {
			return res.status(400).json({
				error: 'Price and cost must be non-negative'
			});
		}

		await connection.beginTransaction();

		// Get staff_id for created_by
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

		// Insert into MEAL table
		const [mealResult] = await connection.query(
			`INSERT INTO MEAL (
				meal_name, meal_description, meal_status, nutrition_facts,
				start_date, end_date, price, cost_to_make, created_by
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				meal_name,
				meal_description,
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

		// Insert meal types if provided
		if (meal_types.length > 0) {
			for (const typeName of meal_types) {
				// Get or create meal type
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

				// Link meal to type
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

// Get all meals
export const getAllMeals = async (req, res) => {
	try {
		const [meals] = await pool.query(`
			SELECT
				m.meal_id,
				m.meal_name,
				m.meal_description,
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
			GROUP BY m.meal_id
			ORDER BY m.meal_id
		`);

		const formattedMeals = meals.map(meal => ({
			...meal,
			nutrition_facts: JSON.parse(meal.nutrition_facts || '{}'),
			meal_types: meal.meal_types ? meal.meal_types.split(',') : []
		}));

		res.json({
			meals: formattedMeals,
			count: formattedMeals.length
		});

	} catch (error) {
		console.error('Get all meals error:', error);
		res.status(500).json({ error: 'Failed to retrieve meals', details: error.message });
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

		if (meals.length === 0) {
			return res.status(404).json({ error: 'Meal not found' });
		}

		const meal = meals[0];
		res.json({
			meal: {
				...meal,
				nutrition_facts: JSON.parse(meal.nutrition_facts || '{}'),
				meal_types: meal.meal_types ? meal.meal_types.split(',') : []
			}
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
		const {
			meal_name,
			meal_description,
			meal_status,
			nutrition_facts,
			start_date,
			end_date,
			price,
			cost_to_make,
			meal_types
		} = req.body;

		await connection.beginTransaction();

		// Check if meal exists
		const [existingMeals] = await connection.query(
			'SELECT meal_id FROM MEAL WHERE meal_id = ?',
			[id]
		);

		if (existingMeals.length === 0) {
			await connection.rollback();
			return res.status(404).json({ error: 'Meal not found' });
		}

		// Get staff_id for updated_by
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

		// Update MEAL table
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

		// Update meal types if provided
		if (meal_types !== undefined) {
			// Remove existing type links
			await connection.query(
				'DELETE FROM MEAL_TYPE_LINK WHERE meal_ref = ?',
				[id]
			);

			// Add new type links
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

		// Get updated meal data
		const [updatedMeals] = await pool.query(`
			SELECT
				m.meal_id,
				m.meal_name,
				m.meal_description,
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
		res.json({
			message: 'Meal updated successfully',
			meal: {
				...meal,
				nutrition_facts: JSON.parse(meal.nutrition_facts || '{}'),
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

		// Check if meal exists
		const [existingMeals] = await connection.query(
			'SELECT meal_id FROM MEAL WHERE meal_id = ?',
			[id]
		);

		if (existingMeals.length === 0) {
			await connection.rollback();
			return res.status(404).json({ error: 'Meal not found' });
		}

		// Delete meal type links (cascade will handle this, but being explicit)
		await connection.query('DELETE FROM MEAL_TYPE_LINK WHERE meal_ref = ?', [id]);

		// Delete meal
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