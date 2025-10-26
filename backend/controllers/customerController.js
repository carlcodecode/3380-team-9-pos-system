import pool from '../config/database.js';

// Get customer profile
export const getCustomerProfile = async (req, res) => {
  try {
    const customerId = req.user.customerId;

    const [customers] = await pool.query(
      `SELECT c.customer_id, c.first_name, c.last_name, c.street, c.city, c.state_code, 
              c.zipcode, c.phone_number, c.loyalty_points, c.total_amount_spent,
              u.email, u.username
       FROM CUSTOMER c
       JOIN USER_ACCOUNT u ON c.user_ref = u.user_id
       WHERE c.customer_id = ?`,
      [customerId]
    );

    if (customers.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const customer = customers[0];
    res.json({
      customer: {
        id: customer.customer_id,
        firstName: customer.first_name,
        lastName: customer.last_name,
        email: customer.email,
        username: customer.username,
        phone: customer.phone_number,
        address: customer.street || '',
        city: customer.city,
        state: customer.state_code,
        zipcode: customer.zipcode,
        loyaltyPoints: customer.loyalty_points,
        totalSpent: customer.total_amount_spent
      }
    });
  } catch (error) {
    console.error('Get customer profile error:', error);
    res.status(500).json({ error: 'Failed to get customer profile' });
  }
};

// Update customer profile
export const updateCustomerProfile = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const customerId = req.user.customerId;
    const { firstName, lastName, email, phone, address } = req.body;

    await connection.beginTransaction();

    // Update CUSTOMER table
    await connection.query(
      `UPDATE CUSTOMER 
       SET first_name = ?, last_name = ?, street = ?, phone_number = ?
       WHERE customer_id = ?`,
      [firstName, lastName, address || null, phone || null, customerId]
    );

    // Update USER_ACCOUNT table (email)
    await connection.query(
      `UPDATE USER_ACCOUNT 
       SET email = ?
       WHERE user_id = (SELECT user_ref FROM CUSTOMER WHERE customer_id = ?)`,
      [email, customerId]
    );

    await connection.commit();

    // Fetch updated customer data
    const [customers] = await pool.query(
      `SELECT c.customer_id, c.first_name, c.last_name, c.street, c.phone_number,
              c.loyalty_points, c.total_amount_spent, u.email, u.username
       FROM CUSTOMER c
       JOIN USER_ACCOUNT u ON c.user_ref = u.user_id
       WHERE c.customer_id = ?`,
      [customerId]
    );

    const customer = customers[0];

    // Update localStorage user object
    const updatedUser = {
      id: req.user.userId,
      customerId: customer.customer_id,
      email: customer.email,
      username: customer.username,
      firstName: customer.first_name,
      lastName: customer.last_name,
      address: customer.street,
      phone: customer.phone_number,
      role: 'customer',
      loyaltyPoints: customer.loyalty_points,
      totalSpent: customer.total_amount_spent
    };

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    await connection.rollback();
    console.error('Update customer profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  } finally {
    connection.release();
  }
};

// Get customer payment methods
export const getPaymentMethods = async (req, res) => {
  try {
    const customerId = req.user.customerId;

    const [paymentMethods] = await pool.query(
      `SELECT payment_method_id, payment_type, last_four, exp_date,
              billing_street, billing_city, billing_state_code, billing_zipcode,
              first_name, middle_init, last_name, created_at
       FROM PAYMENT_METHOD
       WHERE customer_ref = ?
       ORDER BY created_at DESC`,
      [customerId]
    );

    res.json({
      paymentMethods: paymentMethods.map(pm => ({
        id: pm.payment_method_id,
        type: pm.payment_type, // 0 = credit, 1 = debit
        last4: pm.last_four,
        expiryDate: pm.exp_date,
        billingAddress: {
          street: pm.billing_street,
          city: pm.billing_city,
          state: pm.billing_state_code,
          zipcode: pm.billing_zipcode
        },
        nameOnCard: `${pm.first_name}${pm.middle_init ? ' ' + pm.middle_init + '.' : ''} ${pm.last_name}`,
        createdAt: pm.created_at
      }))
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ error: 'Failed to get payment methods' });
  }
};

// Add payment method
export const addPaymentMethod = async (req, res) => {
  try {
    const customerId = req.user.customerId;
    const { 
      cardNumber, 
      nameOnCard, 
      expiryDate, 
      billingStreet,
      billingCity,
      billingState,
      billingZipcode,
      paymentType 
    } = req.body;

    // Validation - all billing fields are required (NOT NULL in schema)
    if (!cardNumber || !nameOnCard || !expiryDate || !billingStreet || !billingCity || !billingState || !billingZipcode) {
      return res.status(400).json({ error: 'All fields including complete billing address are required' });
    }

    // Validate state code (must be 2 characters)
    if (billingState.length !== 2) {
      return res.status(400).json({ error: 'State code must be 2 characters (e.g., TX, CA)' });
    }

    // Validate zipcode (must be 5 characters)
    if (billingZipcode.length !== 5 || !/^\d{5}$/.test(billingZipcode)) {
      return res.status(400).json({ error: 'Zipcode must be 5 digits' });
    }

    // Extract last 4 digits
    const last4 = cardNumber.replace(/\s/g, '').slice(-4);
    
    // Parse name (basic parsing - first name, optional middle initial, last name)
    const nameParts = nameOnCard.trim().split(/\s+/);
    const firstName = nameParts[0] || 'Unknown';
    const lastName = nameParts[nameParts.length - 1] || 'Unknown';
    const middleInit = nameParts.length > 2 ? nameParts[1].charAt(0).toUpperCase() : null;

    const [result] = await pool.query(
      `INSERT INTO PAYMENT_METHOD 
       (customer_ref, payment_type, last_four, exp_date, billing_street, 
        billing_city, billing_state_code, billing_zipcode, first_name, middle_init, last_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customerId, 
        paymentType || 0, 
        last4, 
        expiryDate, 
        billingStreet, 
        billingCity, 
        billingState.toUpperCase(), 
        billingZipcode, 
        firstName, 
        middleInit, 
        lastName
      ]
    );

    res.status(201).json({
      message: 'Payment method added successfully',
      paymentMethod: {
        id: result.insertId,
        type: paymentType || 0,
        last4: last4,
        expiryDate: expiryDate,
        nameOnCard: nameOnCard
      }
    });

  } catch (error) {
    console.error('Add payment method error:', error);
    res.status(500).json({ error: 'Failed to add payment method', details: error.message });
  }
};

// Delete payment method
export const deletePaymentMethod = async (req, res) => {
  try {
    const customerId = req.user.customerId;
    const { paymentMethodId } = req.params;

    // Verify the payment method belongs to this customer
    const [paymentMethods] = await pool.query(
      'SELECT payment_method_id FROM PAYMENT_METHOD WHERE payment_method_id = ? AND customer_ref = ?',
      [paymentMethodId, customerId]
    );

    if (paymentMethods.length === 0) {
      return res.status(404).json({ error: 'Payment method not found' });
    }

    await pool.query('DELETE FROM PAYMENT_METHOD WHERE payment_method_id = ?', [paymentMethodId]);

    res.json({ message: 'Payment method deleted successfully' });

  } catch (error) {
    console.error('Delete payment method error:', error);
    res.status(500).json({ error: 'Failed to delete payment method' });
  }
};
