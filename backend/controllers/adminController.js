import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import { getUserRole } from '../utils/roleHelper.js';

// Create new staff user
export const createStaff = async (req, res) => {
	console.log('Create staff request received:', { ...req.body, password: '***' });
	const connection = await pool.getConnection();

	try {
		const { email, password, firstName, lastName, username } = req.body;

		// Validation
		if (!email || !password || !username) {
			return res.status(400).json({
				error: 'Email, username, and password are required'
			});
		}

		if (password.length < 6) {
			return res.status(400).json({
				error: 'Password must be at least 6 characters'
			});
		}

		await connection.beginTransaction();

		// Check if user exists
		const [existingUsers] = await connection.query(
			'SELECT user_id FROM USER_ACCOUNT WHERE email = ? OR username = ?',
			[email, username]
		);

		if (existingUsers.length > 0) {
			await connection.rollback();
			return res.status(409).json({
				error: 'Email or username already registered'
			});
		}

		// Hash password
		const passwordHash = await bcrypt.hash(password, 10);

		// Insert into USER_ACCOUNT (role 1 = staff)
		const [userResult] = await connection.query(
			'INSERT INTO USER_ACCOUNT (username, user_password, email, user_role) VALUES (?, ?, ?, ?)',
			[username, passwordHash, email, 1]
		);

		const userId = userResult.insertId;

		// Insert into STAFF table
		// Get the admin's staff_id for created_by field
		const adminUserId = req.user.userId;
		const [adminStaff] = await connection.query(
			'SELECT staff_id FROM STAFF WHERE user_ref = ?',
			[adminUserId]
		);

		let createdById = null;
		if (adminStaff.length > 0) {
			createdById = adminStaff[0].staff_id;
		}

		const [staffResult] = await connection.query(
			'INSERT INTO STAFF (user_ref, first_name, last_name, created_by) VALUES (?, ?, ?, ?)',
			[userId, firstName || '', lastName || '', createdById]
		);

		await connection.commit();

		res.status(201).json({
			message: 'Staff user created successfully',
			staff: {
				id: userId,
				staffId: staffResult.insertId,
				email,
				username,
				firstName: firstName || '',
				lastName: lastName || '',
				role: 'staff'
			}
		});

	} catch (error) {
		await connection.rollback();
		console.error('Create staff error:', error);
		res.status(500).json({ error: 'Failed to create staff user', details: error.message });
	} finally {
		connection.release();
	}
};

// Get all staff users
export const getAllStaff = async (req, res) => {
	try {
		const [staff] = await pool.query(`
SELECT
ua.user_id,
ua.username,
ua.email,
ua.user_role,
s.staff_id,
s.first_name,
s.last_name
FROM USER_ACCOUNT ua
JOIN STAFF s ON ua.user_id = s.user_ref
WHERE ua.user_role = 1
ORDER BY ua.user_id
`);

		const staffWithRoles = staff.map(user => ({
			...user,
			role: getUserRole(user.user_role)
		}));

		res.json({
			staff: staffWithRoles,
			count: staffWithRoles.length
		});

	} catch (error) {
		console.error('Get all staff error:', error);
		res.status(500).json({ error: 'Failed to retrieve staff users', details: error.message });
	}
};

// Get staff user by ID
export const getStaffById = async (req, res) => {
	try {
		const { id } = req.params;

		const [staff] = await pool.query(`
SELECT
ua.user_id,
ua.username,
ua.email,
ua.user_role,
s.staff_id,
s.first_name,
s.last_name
FROM USER_ACCOUNT ua
JOIN STAFF s ON ua.user_id = s.user_ref
WHERE ua.user_id = ? AND ua.user_role = 1
`, [id]);

		if (staff.length === 0) {
			return res.status(404).json({ error: 'Staff user not found' });
		}

		const user = staff[0];
		res.json({
			staff: {
				...user,
				role: getUserRole(user.user_role)
			}
		});

	} catch (error) {
		console.error('Get staff by ID error:', error);
		res.status(500).json({ error: 'Failed to retrieve staff user', details: error.message });
	}
};

// Update staff user
export const updateStaff = async (req, res) => {
	console.log('Update staff request received:', { id: req.params.id, ...req.body, password: req.body.password ? '***' : undefined });
	const connection = await pool.getConnection();

	try {
		const { id } = req.params;
		const { email, password, firstName, lastName, username } = req.body;

		await connection.beginTransaction();

		// Check if staff user exists
		const [existingStaff] = await connection.query(`
SELECT ua.user_id, ua.username, ua.email
FROM USER_ACCOUNT ua
JOIN STAFF s ON ua.user_id = s.user_ref
WHERE ua.user_id = ? AND ua.user_role = 1
`, [id]);

		if (existingStaff.length === 0) {
			await connection.rollback();
			return res.status(404).json({ error: 'Staff user not found' });
		}

		// Check for email/username conflicts if updating them
		if (email || username) {
			const conditions = [];
			const params = [];

			if (email) {
				conditions.push('email = ?');
				params.push(email);
			}
			if (username) {
				conditions.push('username = ?');
				params.push(username);
			}

			const [conflicts] = await connection.query(
				`SELECT user_id FROM USER_ACCOUNT WHERE (${conditions.join(' OR ')}) AND user_id != ?`,
				[...params, id]
			);

			if (conflicts.length > 0) {
				await connection.rollback();
				return res.status(409).json({ error: 'Email or username already in use' });
			}
		}

		// Update USER_ACCOUNT
		const updateFields = [];
		const updateParams = [];

		if (username) {
			updateFields.push('username = ?');
			updateParams.push(username);
		}
		if (email) {
			updateFields.push('email = ?');
			updateParams.push(email);
		}
		if (password) {
			if (password.length < 6) {
				await connection.rollback();
				return res.status(400).json({ error: 'Password must be at least 6 characters' });
			}
			const passwordHash = await bcrypt.hash(password, 10);
			updateFields.push('user_password = ?');
			updateParams.push(passwordHash);
		}

		if (updateFields.length > 0) {
			updateParams.push(id);
			await connection.query(
				`UPDATE USER_ACCOUNT SET ${updateFields.join(', ')} WHERE user_id = ?`,
				updateParams
			);
		}

		// Update STAFF table
		if (firstName !== undefined || lastName !== undefined) {
			const staffUpdateFields = [];
			const staffUpdateParams = [];

			if (firstName !== undefined) {
				staffUpdateFields.push('first_name = ?');
				staffUpdateParams.push(firstName);
			}
			if (lastName !== undefined) {
				staffUpdateFields.push('last_name = ?');
				staffUpdateParams.push(lastName);
			}

			if (staffUpdateFields.length > 0) {
				staffUpdateParams.push(id);
				await connection.query(
					`UPDATE STAFF SET ${staffUpdateFields.join(', ')} WHERE user_ref = ?`,
					staffUpdateParams
				);
			}
		}

		await connection.commit();

		// Get updated staff data
		const [updatedStaff] = await pool.query(`
SELECT
ua.user_id,
ua.username,
ua.email,
ua.user_role,
s.staff_id,
s.first_name,
s.last_name
FROM USER_ACCOUNT ua
JOIN STAFF s ON ua.user_id = s.user_ref
WHERE ua.user_id = ?
`, [id]);

		const user = updatedStaff[0];
		res.json({
			message: 'Staff user updated successfully',
			staff: {
				...user,
				role: getUserRole(user.user_role)
			}
		});

	} catch (error) {
		await connection.rollback();
		console.error('Update staff error:', error);
		res.status(500).json({ error: 'Failed to update staff user', details: error.message });
	} finally {
		connection.release();
	}
};

// Delete staff user (hard delete)
export const deleteStaff = async (req, res) => {
	console.log('Delete staff request received:', { id: req.params.id });
	const connection = await pool.getConnection();

	try {
		const { id } = req.params;

		await connection.beginTransaction();

		// Check if staff user exists
		const [existingStaff] = await connection.query(`
SELECT ua.user_id
FROM USER_ACCOUNT ua
JOIN STAFF s ON ua.user_id = s.user_ref
WHERE ua.user_id = ? AND ua.user_role = 1
`, [id]);

		if (existingStaff.length === 0) {
			await connection.rollback();
			return res.status(404).json({ error: 'Staff user not found' });
		}

		// Delete from STAFF table first (foreign key constraint)
		await connection.query('DELETE FROM STAFF WHERE user_ref = ?', [id]);

		// Delete from USER_ACCOUNT
		await connection.query('DELETE FROM USER_ACCOUNT WHERE user_id = ?', [id]);

		await connection.commit();

		res.json({ message: 'Staff user deleted successfully' });

	} catch (error) {
		await connection.rollback();
		console.error('Delete staff error:', error);
		res.status(500).json({ error: 'Failed to delete staff user', details: error.message });
	} finally {
		connection.release();
	}
};
