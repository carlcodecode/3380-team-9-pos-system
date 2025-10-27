import pool from '../config/database.js';

export const createSaleEvent = async (req, res) => {
	console.log('Create sale event request received:', req.body);
	const connection = await pool.getConnection();

	try {
		const { event_name, event_description, event_start, event_end, meals = [] } = req.body;

		console.log('Parsed body:', { event_name, event_description, event_start, event_end, meals_count: meals.length });

		// Validation (can add meals later)
		if (!event_name || !event_start || !event_end) {
			console.log('Missing required fields');
			return res.status(400).json({ error: 'All fields are required' });
		}

		if (isNaN(Date.parse(event_start))) {
			console.log('Invalid start date');
			return res.status(400).json({ error: 'Event start date is invalid' });
		}
		if (isNaN(Date.parse(event_end))) {
			console.log('Invalid end date');
			return res.status(400).json({ error: 'Event end date is invalid' });
		}

		await connection.beginTransaction();
		console.log('🧾 Transaction started');

		// Get staff_id for created_by
		console.log('🔍 Checking staff for user_ref:', req.user?.userId);
		const [staff] = await connection.query('SELECT staff_id FROM STAFF WHERE user_ref = ?', [req.user?.userId]);
		console.log('🔍 Staff lookup result:', staff);

		if (staff.length === 0) {
			console.log('No staff found for user');
			await connection.rollback();
			return res.status(403).json({ error: 'Staff user not found' });
		}

		const createdById = staff[0].staff_id;

		// Insert into SALE_EVENT
		console.log('Inserting sale event...');
		const [result] = await connection.query(
			`INSERT INTO SALE_EVENT (
				event_name, event_description, event_start, event_end, created_by, created_at, last_updated_at
			) VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
			[event_name, event_description, event_start, event_end, createdById]
		);

		const saleEventId = result.insertId;
		console.log('SALE_EVENT inserted with ID:', saleEventId);

		// Insert meals
		if (meals.length > 0) {
			console.log(`🧾 Inserting ${meals.length} meals for sale_event_id=${saleEventId}`);
			for (const { meal_ref, discount_rate } of meals) {
				console.log('🔹 Attempting meal insert:', { meal_ref, discount_rate });

				if (!meal_ref || discount_rate === undefined) {
					console.log('Invalid meal entry, rolling back');
					await connection.rollback();
					return res.status(400).json({ error: 'Each meal must have meal_ref and discount_rate' });
				}
				if (discount_rate < 0 || discount_rate >= 100) {
					console.log('Invalid discount rate, rolling back');
					await connection.rollback();
					return res.status(400).json({ error: 'Discount rate must be between 0 and 100' });
				}

				try {
					await connection.query(
						`INSERT INTO MEAL_SALE (meal_ref, sale_event_ref, discount_rate)
						 VALUES (?, ?, ?)`,
						[meal_ref, saleEventId, discount_rate]
					);
					console.log('Inserted MEAL_SALE for meal_ref:', meal_ref);
				} catch (mealError) {
					console.error('❌ Meal insert failed:', mealError.sqlMessage || mealError.message);
					throw mealError; // Let it bubble to rollback
				}
			}
		} else {
			console.log('No meals provided, skipping MEAL_SALE inserts');
		}

		await connection.commit();
		console.log('Transaction committed successfully');

		res.status(201).json({
			message: 'Sale event created successfully',
			sale_event: {
				sale_event_id: saleEventId,
				event_name,
				event_description,
				event_start,
				event_end,
				created_by: createdById,
				created_at: new Date(),
				meals,
			},
		});
	} catch (error) {
		console.error('Create sale event error:', error.sqlMessage || error.message);
		await connection.rollback();
		res.status(500).json({
			error: 'Failed to create sale event',
			details: error.sqlMessage || error.message,
		});
	} finally {
		console.log('🔚 Releasing connection');
		connection.release();
	}
};


// Get all sale events
export const getAllSaleEvents = async (req, res) => {
	try {
		const [events] = await pool.query(`
		SELECT
			s.sale_event_id,
			s.event_name,
			s.event_description,
			s.event_start,
			s.event_end,
			s.created_by,
			s.created_at,
			s.updated_by,
			s.last_updated_at,
			COALESCE(
				JSON_ARRAYAGG(
					CASE 
					WHEN ms.meal_ref IS NOT NULL THEN
						JSON_OBJECT(
						'meal_ref', ms.meal_ref,
						'meal_name', m.meal_name,
						'discount_rate', ms.discount_rate
						)
					END
				),
				JSON_ARRAY()
				) AS meals
		FROM SALE_EVENT s
		LEFT JOIN MEAL_SALE ms ON s.sale_event_id = ms.sale_event_ref
		LEFT JOIN MEAL m ON ms.meal_ref = m.meal_id
		GROUP BY s.sale_event_id
		ORDER BY s.sale_event_id
		`);

		res.json({
			sale_events: events,
			count: events.length,
		});
	} catch (error) {
		console.error('Get all sale event error:', error);
		res.status(500).json({ error: 'Failed to retrieve sale events', details: error.message });
	}
};

// Get sale event by ID
export const getSaleEventById = async (req, res) => {
	try {
		const { id } = req.params;

		const [rows] = await pool.query(
					`
		SELECT
		s.sale_event_id,
		s.event_name,
		s.event_description,
		s.event_start,
		s.event_end,
		s.created_by,
		s.created_at,
		s.updated_by,
		s.last_updated_at,
		JSON_ARRAYAGG(
		CASE WHEN ms.meal_ref IS NOT NULL THEN
			JSON_OBJECT(
			'meal_ref', ms.meal_ref,
			'discount_rate', ms.discount_rate
			)
		END
		) AS meals
		FROM SALE_EVENT s
		LEFT JOIN MEAL_SALE ms ON s.sale_event_id = ms.sale_event_ref
		WHERE s.sale_event_id = ?
		GROUP BY s.sale_event_id
		`,
			[id],
		);

		if (rows.length === 0) {
			return res.status(404).json({ error: 'Sale event not found' });
		}

		const event = rows[0];

		// If no meals return [] so front end doesn't get confused
		event.meals = event.meals ? JSON.parse(event.meals) : [];

		res.json({ sale_event: event });
	} catch (error) {
		console.error('Get sale event by ID error:', error);
		res.status(500).json({ error: 'Failed to retrieve sale event', details: error.message });
	}
};

export const updateSaleEvent = async (req, res) => {
  const { id } = req.params;
  console.log(`Update sale event request for ID ${id}`);
  console.log('Body received:', req.body);

  const connection = await pool.getConnection();

  try {
    const { event_name, event_description, event_start, event_end, meals = [] } = req.body;

    if (!event_name || !event_start || !event_end) {
      console.log('Missing required fields in update');
      return res.status(400).json({
        error: 'Event name, start date, and end date are required',
      });
    }

    await connection.beginTransaction();
    console.log('Transaction started for update');

    // Check existing record
    const [existing] = await connection.query('SELECT * FROM SALE_EVENT WHERE sale_event_id = ?', [id]);
    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Sale event not found' });
    }

    console.log('🔍 Existing event:', existing[0]);

    // Normalize fields
    const desc = event_description?.trim() || null;

    // Update SALE_EVENT
    console.log('🧾 Updating SALE_EVENT...');
    await connection.query(
      `UPDATE SALE_EVENT 
       SET event_name = ?, event_description = ?, event_start = ?, event_end = ?, 
           last_updated_at = NOW() 
       WHERE sale_event_id = ?`,
      [event_name, desc, event_start, event_end, id]
    );
    console.log('SALE_EVENT updated successfully');

    // Clear existing meals
    console.log('🧹 Deleting old MEAL_SALE links...');
    await connection.query('DELETE FROM MEAL_SALE WHERE sale_event_ref = ?', [id]);

    // Re-insert new meals (if any)
    if (meals.length > 0) {
      console.log(`Reinserting ${meals.length} meals`);
      for (const { meal_ref, discount_rate } of meals) {
        console.log('🔹 Inserting meal link:', { meal_ref, discount_rate });
        await connection.query(
          `INSERT INTO MEAL_SALE (meal_ref, sale_event_ref, discount_rate)
           VALUES (?, ?, ?)`,
          [meal_ref, id, discount_rate]
        );
      }
    } else {
      console.log('No meals provided for update');
    }

    await connection.commit();
    console.log('Transaction committed for update');

    res.status(200).json({
      message: 'Sale event updated successfully',
      sale_event: {
        sale_event_id: id,
        event_name,
        event_description: desc,
        event_start,
        event_end,
        meals,
      },
    });
  } catch (error) {
    console.error('Update sale event error:', error.sqlMessage || error.message);
    await connection.rollback();
    res.status(500).json({
      error: 'Failed to update sale event',
      details: error.sqlMessage || error.message,
    });
  } finally {
    connection.release();
    console.log('🔚 Connection released');
  }
};

// Delete sale event
export const deleteSaleEvent = async (req, res) => {
  console.log('Delete sale event request received:', { id: req.params.id });
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;

    await connection.beginTransaction();

    // Ensure event exists
    const [existing] = await connection.query(
      'SELECT sale_event_id FROM SALE_EVENT WHERE sale_event_id = ?',
      [id]
    );
    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Sale event not found' });
    }

    // 🧹 Delete related MEAL_SALE records first
    await connection.query('DELETE FROM MEAL_SALE WHERE sale_event_ref = ?', [id]);

    // Then delete the SALE_EVENT itself
    await connection.query('DELETE FROM SALE_EVENT WHERE sale_event_id = ?', [id]);

    await connection.commit();

    res.json({
      message: 'Sale event and related meals deleted successfully',
      deleted_sale_event_id: id
    });
  } catch (error) {
    await connection.rollback();
    console.error('Delete sale event error:', error);
    res.status(500).json({
      error: 'Failed to delete sale event',
      details: error.message
    });
  } finally {
    connection.release();
  }
};
