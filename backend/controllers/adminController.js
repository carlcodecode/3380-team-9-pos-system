import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import { getUserRole } from '../utils/roleHelper.js';

// Create new staff user
export const createStaff = async (req, res) => {
  console.log('Create staff request received:', { ...req.body, password: '***' });
  const connection = await pool.getConnection();

  try {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      username, 
      phone_number, 
      hire_date, 
      salary 
    } = req.body;
	console.log(phone_number, hire_date, salary);

    // Validation
    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Email, username, and password are required' });
    }

    if (!phone_number || !hire_date || !salary) {
      return res.status(400).json({ error: 'Phone number, hire date, and salary are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    await connection.beginTransaction();

    // Check if user exists
    const [existingUsers] = await connection.query(
      'SELECT user_id FROM USER_ACCOUNT WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUsers.length > 0) {
      await connection.rollback();
      return res.status(409).json({ error: 'Email or username already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert into USER_ACCOUNT (role 1 = staff)
    const [userResult] = await connection.query(
      'INSERT INTO USER_ACCOUNT (username, user_password, email, user_role) VALUES (?, ?, ?, ?)',
      [username, passwordHash, email, 1]
    );

    const userId = userResult.insertId;

    // Get admin's staff_id for created_by field
    const adminUserId = req.user.userId;
    const [adminStaff] = await connection.query(
      'SELECT staff_id FROM STAFF WHERE user_ref = ?',
      [adminUserId]
    );

    let createdById = null;
    if (adminStaff.length > 0) {
      createdById = adminStaff[0].staff_id;
    }

    // Insert into STAFF table
    const [staffResult] = await connection.query(
      `INSERT INTO STAFF (
        user_ref, first_name, last_name, phone_number, hire_date, salary, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [userId, firstName || '', lastName || '', phone_number, hire_date, salary, createdById]
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
        phone_number,
        hire_date,
        salary,
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
        s.last_name,
        s.phone_number,
        s.hire_date,
        s.salary,
        s.created_by,
        s.created_at,
        s.updated_by,
        s.last_updated_at
      FROM USER_ACCOUNT ua
      JOIN STAFF s ON ua.user_id = s.user_ref
      WHERE ua.user_role = 1
      ORDER BY ua.user_id;
    `);

    const staffWithRoles = staff.map(user => ({
      ...user,
      role: getUserRole(user.user_role),
    }));

    res.json({
      staff: staffWithRoles,
      count: staffWithRoles.length,
    });

  } catch (error) {
    console.error('Get all staff error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve staff users', 
      details: error.message 
    });
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
        s.last_name,
        s.phone_number,
        s.hire_date,
        s.salary,
        s.created_by,
        s.created_at,
        s.updated_by,
        s.last_updated_at,
        creator.first_name AS created_by_first_name,
        creator.last_name AS created_by_last_name,
        updater.first_name AS updated_by_first_name,
        updater.last_name AS updated_by_last_name
      FROM USER_ACCOUNT ua
      JOIN STAFF s ON ua.user_id = s.user_ref
      LEFT JOIN STAFF creator ON s.created_by = creator.staff_id
      LEFT JOIN STAFF updater ON s.updated_by = updater.staff_id
      WHERE ua.user_id = ? AND ua.user_role = 1
    `, [id]);

    if (staff.length === 0) {
      return res.status(404).json({ error: 'Staff user not found' });
    }

    const user = staff[0];

    res.json({
      staff: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: getUserRole(user.user_role),
        staff_id: user.staff_id,
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number,
        hire_date: user.hire_date,
        salary: user.salary,
        created_at: user.created_at,
        last_updated_at: user.last_updated_at,
        created_by: user.created_by
          ? `${user.created_by_first_name || ''} ${user.created_by_last_name || ''}`.trim()
          : null,
        updated_by: user.updated_by
          ? `${user.updated_by_first_name || ''} ${user.updated_by_last_name || ''}`.trim()
          : null
      }
    });

  } catch (error) {
    console.error('Get staff by ID error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve staff user', 
      details: error.message 
    });
  }
};

// Update staff user
export const updateStaff = async (req, res) => {
  console.log('Update staff request received:', { id: req.params.id, ...req.body, password: req.body.password ? '***' : undefined });
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const { email, password, firstName, lastName, username, phone_number, hire_date, salary } = req.body;

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

    // === Update USER_ACCOUNT ===
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

    // === Update STAFF table ===
    if (
      firstName !== undefined || 
      lastName !== undefined || 
      phone_number !== undefined || 
      hire_date !== undefined || 
      salary !== undefined
    ) {
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
      if (phone_number !== undefined) {
        staffUpdateFields.push('phone_number = ?');
        staffUpdateParams.push(phone_number);
      }
      if (hire_date !== undefined) {
        staffUpdateFields.push('hire_date = ?');
        staffUpdateParams.push(hire_date);
      }
      if (salary !== undefined) {
        staffUpdateFields.push('salary = ?');
        staffUpdateParams.push(salary);
      }

      // track who made the update
      const adminUserId = req.user.userId;
      const [adminStaff] = await connection.query(
        'SELECT staff_id FROM STAFF WHERE user_ref = ?',
        [adminUserId]
      );

      let updatedById = null;
      if (adminStaff.length > 0) {
        updatedById = adminStaff[0].staff_id;
      }

      staffUpdateFields.push('updated_by = ?');
      staffUpdateParams.push(updatedById);

      staffUpdateFields.push('last_updated_at = NOW()');

      staffUpdateParams.push(id);
      await connection.query(
        `UPDATE STAFF SET ${staffUpdateFields.join(', ')} WHERE user_ref = ?`,
        staffUpdateParams
      );
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
        s.last_name,
        s.phone_number,
        s.hire_date,
        s.salary,
        s.last_updated_at
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
			return res.json({ error: 'Staff user not found' }, 404);
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
		res.json({ error: 'Failed to delete staff user', details: error.message }, 500);
	} finally {
		connection.release();
	}
};

// Get Staff/Meal Created report
export const getStaffMealCreatedReport = async (req, res) => {
	try {
		const { start_date, end_date, staff_id } = req.query;

		let query = `
			SELECT
				staff_id,
				first_name,
				last_name,
				activity_type,
				meal_id,
				meal_name,
				meal_description,
				meal_status,
				price_cents,
				cost_cents,
				activity_timestamp
			FROM v_staff_activity
			WHERE activity_type = 'CREATED'
		`;

		const params = [];

		if (start_date) {
			query += ' AND activity_timestamp >= ?';
			params.push(start_date);
		}

		if (end_date) {
			query += ' AND activity_timestamp <= ?';
			params.push(end_date);
		}

		if (staff_id) {
			query += ' AND staff_id = ?';
			params.push(staff_id);
		}

		query += ' ORDER BY activity_timestamp DESC';

		const [results] = await pool.query(query, params);

		res.json({
			report: 'Staff Meal Created',
			filters: { start_date, end_date, staff_id },
			data: results,
			count: results.length
		});

	} catch (error) {
		console.error('Get staff meal created report error:', error);
		res.status(500).json({
			error: 'Failed to retrieve staff meal created report',
			details: error.message
		});
	}
};

// Get Staff/Meal Updated report
export const getStaffMealUpdatedReport = async (req, res) => {
	try {
		const { start_date, end_date, staff_id } = req.query;

		let query = `
			SELECT
				staff_id,
				first_name,
				last_name,
				activity_type,
				meal_id,
				meal_name,
				meal_description,
				meal_status,
				price_cents,
				cost_cents,
				activity_timestamp
			FROM v_staff_activity
			WHERE activity_type = 'UPDATED'
		`;

		const params = [];

		if (start_date) {
			query += ' AND activity_timestamp >= ?';
			params.push(start_date);
		}

		if (end_date) {
			query += ' AND activity_timestamp <= ?';
			params.push(end_date);
		}

		if (staff_id) {
			query += ' AND staff_id = ?';
			params.push(staff_id);
		}

		query += ' ORDER BY activity_timestamp DESC';

		const [results] = await pool.query(query, params);

		res.json({
			report: 'Staff Meal Updated',
			filters: { start_date, end_date, staff_id },
			data: results,
			count: results.length
		});

	} catch (error) {
		console.error('Get staff meal updated report error:', error);
		res.status(500).json({
			error: 'Failed to retrieve staff meal updated report',
			details: error.message
		});
	}
};
