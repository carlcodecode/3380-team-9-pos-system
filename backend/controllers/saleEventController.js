import pool from '../config/database.js';

// Create sale event
export const createSaleEvent = async (req, res) => {
	console.log('Create sale event request received:', req.body);
	const connection = await pool.getConnection();

	try {
		const { event_description, event_start, event_end, sitewide_event_type, sitewide_discount_value } = req.body;

		// Validation
		if (!event_description || sitewide_event_type === undefined || !sitewide_discount_value || !event_start || !event_end) {
			return res.status(400).json({
				error: 'All fields are required',
			});
		}

		if (isNaN(Date.parse(event_start))) {
			return res.status(400).json({ error: 'Event start date is invalid' });
		}

		if (isNaN(Date.parse(event_end))) {
			return res.status(400).json({ error: 'Event end date is invalid' });
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

		// Insert into SALE_EVENT table
		const [result] = await connection.query(
			`INSERT INTO SALE_EVENT (
event_description, event_start, event_end, sitewide_event_type, sitewide_discount_value, created_by, created_at
) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
			[event_description, event_start, event_end, sitewide_event_type, sitewide_discount_value, createdById],
		);

		const saleEventId = result.insertId;

		await connection.commit();

		res.status(201).json({
			message: 'Promotion created successfully',
			sale_event: {
				sale_event_id: saleEventId,
				event_description,
				event_start,
				event_end,
				sitewide_event_type,
				sitewide_discount_value,
				created_by: createdById
			},
		});
	} catch (error) {
		await connection.rollback();
		console.error('Create sale event error:', error);
		res.status(500).json({ error: 'Failed to create sale event', details: error.message });
	} finally {
		connection.release();
	}
};

// Get all sale events
export const getAllSaleEvents = async (req, res) => {
	try {
		const [events] = await pool.query(`
SELECT
s.sale_event_id,
s.event_description,
s.event_start,
s.event_end,
s.sitewide_event_type,
s.sitewide_discount_value,
s.created_by,
s.created_at,
s.updated_by,
s.last_updated_at
FROM SALE_EVENT s
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
s.event_description,
s.event_start,
s.event_end,
s.sitewide_event_type,
s.sitewide_discount_value,
s.created_by,
s.created_at,
s.updated_by,
s.last_updated_at
FROM SALE_EVENT s

WHERE s.sale_event_id = ?
`,
			[id],
		);

		if (rows.length === 0) {
			return res.status(404).json({ error: 'Sale event not found' });
		}

		res.json({ sale_event: rows[0] });
	} catch (error) {
		console.error('Get sale event by ID error:', error);
		res.status(500).json({ error: 'Failed to retrieve sale event', details: error.message });
	}
};

// Update sale event
export const updateSaleEvent = async (req, res) => {
	console.log('Update sale event request received:', { id: req.params.id, ...req.body });
	const connection = await pool.getConnection();

	try {
		const { id } = req.params;
		const { event_description, event_start, event_end, sitewide_event_type, sitewide_discount_value } = req.body;

		await connection.beginTransaction();

		// Ensure sale event existence
		const [existing] = await connection.query(
			'SELECT sale_event_id FROM SALE_EVENT WHERE sale_event_id = ?',
			[id],
		);
		if (existing.length === 0) {
			await connection.rollback();
			return res.status(404).json({ error: 'Sale event not found' });
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

		if (event_description !== undefined) {
			fields.push('event_description = ?');
			params.push(event_description);
		}
		if (sitewide_event_type !== undefined) {
			if (!Number.isInteger(sitewide_event_type) || sitewide_event_type < 0) {
				await connection.rollback();
				return res.status(400).json({ error: 'sitewide_event_type must be a non-negative integer' });
			}
			fields.push('sitewide_event_type = ?');
			params.push(sitewide_event_type);
		}

		if (sitewide_discount_value !== undefined) {
			if (!Number.isInteger(sitewide_discount_value) || sitewide_discount_value < 0) {
				await connection.rollback();
				return res.status(400).json({ error: 'Discount value must be a non-negative integer' });
			}
			else if (!Number.isInteger(sitewide_discount_value) || sitewide_discount_value >= 100) {
				await connection.rollback();
				return res.status(400).json({ error: 'Discount value must be below 100.' });
			}

			fields.push('sitewide_discount_value = ?');
			params.push(sitewide_discount_value);
		}

		if (event_start !== undefined) {
			if (isNaN(Date.parse(event_start))) {
				await connection.rollback();
				return res.status(400).json({ error: 'Event start must be a valid date (YYYY-MM-DD)' });
			}
			fields.push('event_start = ?');
			params.push(event_start);
		}

		if (event_end !== undefined) {
			if (isNaN(Date.parse(event_end))) {
				await connection.rollback();
				return res.status(400).json({ error: 'Event end must be a valid date (YYYY-MM-DD)' });
			}
			fields.push('event_end = ?');
			params.push(event_end);
		}

		// Update updated_by
		fields.push('updated_by = ?');
		params.push(updatedById);

		if (fields.length > 0) {
			params.push(id);
			await connection.query(
				`UPDATE SALE_EVENT SET ${fields.join(', ')} WHERE sale_event_id = ?`,
				params,
			);
		}

		await connection.commit();

		// Return updated row
		const [rows] = await pool.query(
			`
SELECT
s.sale_event_id,
s.event_description,
s.event_start,
s.event_end,
s.sitewide_event_type,
s.sitewide_discount_value,
s.created_by,
s.created_at,
s.updated_by,
s.last_updated_at
FROM SALE_EVENT s

WHERE s.sale_event_id = ?
`
,
			[id],
		);

		res.json({
			message: 'Sale event updated successfully',
			sale_event: rows[0],
		});
	} catch (error) {
		await connection.rollback();
		console.error('Update sale event error:', error);
		res.status(500).json({ error: 'Failed to update sale event', details: error.message });
	} finally {
		connection.release();
	}
};

// Delete sale event
export const deleteSaleEvent = async (req, res) => {
	console.log('Delete sale event request received:', { id: req.params.id });
	const connection = await pool.getConnection();

	try {
		const { id } = req.params;

		await connection.beginTransaction();

		// Ensure exists
		const [existing] = await connection.query(
			'SELECT sale_event_id FROM SALE_EVENT WHERE sale_event_id = ?',
			[id],
		);
		if (existing.length === 0) {
			await connection.rollback();
			return res.status(404).json({ error: 'Sale event not found' });
		}

		// Explicit delete
		await connection.query('DELETE FROM SALE_EVENT WHERE sale_event_id = ?', [id]);

		await connection.commit();

		res.json({ message: 'Sale event deleted successfully' });
	} catch (error) {
		await connection.rollback();
		console.error('Delete sale event error:', error);
		res.status(500).json({ error: 'Failed to delete sale event', details: error.message });
	} finally {
		connection.release();
	}
};
