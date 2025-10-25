import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import { getUserRole } from '../utils/roleHelper.js';

// Register new customer
export const register = async (req, res) => {
  console.log('Register request received:', { ...req.body, password: '***' });
  const connection = await pool.getConnection();

  try {
    const { email, password, firstName, lastName, username } = req.body;

    // Validation
    if (!email || !password || !username) {
      return res.json({
        error: 'Email, username, and password are required'
      }, 400);
    }

    if (password.length < 6) {
      return res.json({
        error: 'Password must be at least 6 characters'
      }, 400);
    }

    await connection.beginTransaction();

    // Check if user exists
    const [existingUsers] = await connection.query(
      'SELECT user_id FROM USER_ACCOUNT WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUsers.length > 0) {
      await connection.rollback();
      return res.json({
        error: 'Email or username already registered'
      }, 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert into USER_ACCOUNT (role 0 = customer)
    const [userResult] = await connection.query(
      'INSERT INTO USER_ACCOUNT (username, user_password, email, user_role) VALUES (?, ?, ?, ?)',
      [username, passwordHash, email, 0]
    );

    const userId = userResult.insertId;

    // Insert into CUSTOMER table
    const [customerResult] = await connection.query(
      'INSERT INTO CUSTOMER (user_ref, first_name, last_name, loyalty_points, total_amount_spent, refunds_per_month) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, firstName || '', lastName || '', 0, 0, 0]
    );

    await connection.commit();

    // Generate JWT
    const token = jwt.sign(
      {
        userId,
        email,
        username,
        role: 'customer',
        customerId: customerResult.insertId
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Registration successful',
      token,
      user: {
        id: userId,
        customerId: customerResult.insertId,
        email,
        username,
        firstName: firstName || '',
        lastName: lastName || '',
        role: 'customer'
      }
    }, 201);

  } catch (error) {
    await connection.rollback();
    console.error('Registration error:', error);
    res.json({ error: 'Registration failed', details: error.message }, 500);
  } finally {
    connection.release();
  }
};

// Login
export const login = async (req, res) => {
  console.log('🔐 Login request received:', { username: req.body.username });
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.json({
        error: 'Username and password are required'
      }, 400);
    }

    // Find user
    const [users] = await pool.query(
      'SELECT user_id, username, user_password, email, user_role FROM USER_ACCOUNT WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.json({
        error: 'Invalid username or password'
      }, 401);
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.user_password);

    if (!isValidPassword) {
      return res.json({
        error: 'Invalid username or password'
      }, 401);
    }

    const role = getUserRole(user.user_role);
    let additionalData = {};

    // Get customer or staff data based on role
    if (role === 'customer') {
      const [customers] = await pool.query(
        'SELECT customer_id, first_name, last_name FROM CUSTOMER WHERE user_ref = ?',
        [user.user_id]
      );

      if (customers.length > 0) {
        additionalData = {
          customerId: customers[0].customer_id,
          firstName: customers[0].first_name,
          lastName: customers[0].last_name
        };
      }
    } else if (role === 'staff' || role === 'admin') {
      const [staff] = await pool.query(
        'SELECT staff_id, first_name, last_name FROM STAFF WHERE user_ref = ?',
        [user.user_id]
      );

      if (staff.length > 0) {
        additionalData = {
          staffId: staff[0].staff_id,
          firstName: staff[0].first_name,
          lastName: staff[0].last_name
        };
      }
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.user_id,
        email: user.email,
        username: user.username,
        role,
        ...additionalData
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.user_id,
        email: user.email,
        username: user.username,
        role,
        ...additionalData
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.json({ error: 'Login failed', details: error.message }, 500);
  }
};

// Get current user (protected route)
export const getCurrentUser = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT user_id, username, email, user_role FROM USER_ACCOUNT WHERE user_id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.json({ error: 'User not found' }, 404);
    }

    const user = users[0];
    const role = getUserRole(user.user_role);

    res.json({
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        role
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.json({ error: 'Failed to get user data' }, 500);
  }
};

// Logout (mainly client-side, but can be used for session cleanup)
export const logout = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};
