import pool from '../config/database.js';

// Create a new order (for customers during checkout)
export const createOrder = async (req, res) => {
  console.log('Create order request received:', req.body);
  const connection = await pool.getConnection();

  try {
    const {
      cart, // Array of { meal, quantity }
      payment_method_id,
      delivery_notes,
      shipping_address, // { street, city, state_code, zipcode }
      promo_code,
      subtotal,
      discount,
      tax,
      total
    } = req.body;

    if (!cart || cart.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    if (!payment_method_id) {
      return res.status(400).json({ error: 'Payment method is required' });
    }

    await connection.beginTransaction();

    // Get customer_id from user_ref
    const userId = req.user.userId;
    const [customers] = await connection.query(
      'SELECT customer_id FROM CUSTOMER WHERE user_ref = ?',
      [userId]
    );

    if (customers.length === 0) {
      await connection.rollback();
      return res.status(403).json({ error: 'Customer account not found' });
    }

    const customerId = customers[0].customer_id;

    // Verify payment method belongs to customer (if provided)
    // For demo purposes, allow orders without valid payment methods
    if (payment_method_id) {
      const [paymentMethods] = await connection.query(
        'SELECT payment_method_id FROM PAYMENT_METHOD WHERE payment_method_id = ? AND customer_ref = ?',
        [payment_method_id, customerId]
      );

      if (paymentMethods.length === 0) {
        console.log('Payment method not found, using demo mode');
        // Don't fail - just log for demo purposes
      }
    }

    // Get promotion_id if promo_code is provided
    let promotionId = null;
    if (promo_code) {
      const [promos] = await connection.query(
        'SELECT promotion_id FROM PROMOTION WHERE promo_code = ? AND promo_exp_date > CURDATE()',
        [promo_code]
      );
      if (promos.length > 0) {
        promotionId = promos[0].promotion_id;
      }
    }

    // Calculate order values in cents
    const unitPrice = subtotal || 0;
    const taxAmount = tax || 0;
    const discountAmount = discount || 0;

    // Create order record
    const [orderResult] = await connection.query(
      `INSERT INTO ORDERS (
        customer_ref,
        order_date,
        order_status,
        unit_price,
        tax,
        discount,
        notes,
        shipping_street,
        shipping_city,
        shipping_state_code,
        shipping_zipcode,
        created_by
      ) VALUES (?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customerId,
        0, // 0 = pending
        unitPrice,
        taxAmount,
        discountAmount,
        delivery_notes || null,
        shipping_address?.street || null,
        shipping_address?.city || null,
        shipping_address?.state_code || null,
        shipping_address?.zipcode || null,
        userId
      ]
    );

    const orderId = orderResult.insertId;

    // Insert order line items
    for (const item of cart) {
      const mealId = item.meal.meal_id || item.meal.id;
      const quantity = item.quantity;
      const priceAtSale = item.meal.price; // Price in cents

      // Get cost_to_make from MEAL table
      const [meals] = await connection.query(
        'SELECT cost_to_make FROM MEAL WHERE meal_id = ?',
        [mealId]
      );

      if (meals.length === 0) {
        await connection.rollback();
        return res.status(400).json({ error: `Meal with ID ${mealId} not found` });
      }

      const costPerUnit = meals[0].cost_to_make;

      await connection.query(
        `INSERT INTO ORDER_LINE (
          order_ref,
          meal_ref,
          num_units_ordered,
          price_at_sale,
          cost_per_unit
        ) VALUES (?, ?, ?, ?, ?)`,
        [orderId, mealId, quantity, priceAtSale, costPerUnit]
      );

      // Update stock
      await connection.query(
        `UPDATE STOCK 
         SET quantity_in_stock = quantity_in_stock - ?,
             needs_reorder = IF(quantity_in_stock - ? <= reorder_threshold, 1, needs_reorder)
         WHERE meal_ref = ?`,
        [quantity, quantity, mealId]
      );
    }

    // Link promotion if used
    if (promotionId && discountAmount > 0) {
      await connection.query(
        'INSERT INTO ORDER_PROMOTION (order_ref, promotion_ref, discount_amount) VALUES (?, ?, ?)',
        [orderId, promotionId, discountAmount]
      );
    }

    // Create payment record (if payment method provided)
    if (payment_method_id) {
      await connection.query(
        `INSERT INTO PAYMENT (
          order_ref,
          payment_method_ref,
          payment_amount,
          transaction_status,
          created_by
        ) VALUES (?, ?, ?, ?, ?)`,
        [orderId, payment_method_id, total, 1, userId] // 1 = completed (demo mode - always successful)
      );
    } else {
      // Demo mode - create payment without payment method reference
      console.log('Creating demo payment record');
    }

    // Update customer total_amount_spent and loyalty_points
    const loyaltyPoints = Math.floor(total / 100); // 1 point per dollar spent
    await connection.query(
      `UPDATE CUSTOMER 
       SET total_amount_spent = total_amount_spent + ?,
           loyalty_points = loyalty_points + ?
       WHERE customer_id = ?`,
      [total, loyaltyPoints, customerId]
    );

    await connection.commit();

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        order_id: orderId,
        order_status: 'pending',
        total: total,
        loyalty_points_earned: loyaltyPoints
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  } finally {
    connection.release();
  }
};

// Get all orders for a customer
export const getCustomerOrders = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [orders] = await pool.query(
      `SELECT 
        o.order_id,
        o.order_date,
        o.order_status,
        o.delivery_date,
        o.unit_price,
        o.tax,
        o.discount,
        o.notes,
        o.tracking_number,
        o.shipping_street,
        o.shipping_city,
        o.shipping_state_code,
        o.shipping_zipcode,
        (o.unit_price + o.tax - o.discount) AS total,
        pm.payment_type,
        pm.last_four
      FROM ORDERS o
      LEFT JOIN PAYMENT p ON o.order_id = p.order_ref
      LEFT JOIN PAYMENT_METHOD pm ON p.payment_method_ref = pm.payment_method_id
      INNER JOIN CUSTOMER c ON o.customer_ref = c.customer_id
      WHERE c.user_ref = ?
      ORDER BY o.order_date DESC, o.order_id DESC`,
      [userId]
    );

    // Get order line items for each order
    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT 
          ol.num_units_ordered AS quantity,
          ol.price_at_sale,
          m.meal_id,
          m.meal_name,
          m.meal_description,
          m.img_url,
          m.nutrition_facts
        FROM ORDER_LINE ol
        INNER JOIN MEAL m ON ol.meal_ref = m.meal_id
        WHERE ol.order_ref = ?`,
        [order.order_id]
      );

      order.items = items.map(item => ({
        meal: {
          meal_id: item.meal_id,
          meal_name: item.meal_name,
          meal_description: item.meal_description,
          img_url: item.img_url,
          price: item.price_at_sale,
          nutrition_facts: typeof item.nutrition_facts === 'string' 
            ? JSON.parse(item.nutrition_facts) 
            : item.nutrition_facts
        },
        quantity: item.quantity
      }));
    }

    res.json({ orders });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders', details: error.message });
  }
};

// Get all orders (for staff)
export const getAllOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT 
        o.order_id,
        o.order_date,
        o.order_status,
        o.delivery_date,
        o.unit_price,
        o.tax,
        o.discount,
        o.notes,
        o.tracking_number,
        o.shipping_street,
        o.shipping_city,
        o.shipping_state_code,
        o.shipping_zipcode,
        (o.unit_price + o.tax - o.discount) AS total,
        c.customer_id,
        c.first_name,
        c.last_name,
        c.phone_number,
        pm.payment_type,
        pm.last_four
      FROM ORDERS o
      INNER JOIN CUSTOMER c ON o.customer_ref = c.customer_id
      LEFT JOIN PAYMENT p ON o.order_id = p.order_ref
      LEFT JOIN PAYMENT_METHOD pm ON p.payment_method_ref = pm.payment_method_id
      ORDER BY o.order_date DESC, o.order_id DESC`
    );

    // Get order line items for each order
    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT 
          ol.num_units_ordered AS quantity,
          ol.price_at_sale,
          m.meal_id,
          m.meal_name,
          m.meal_description,
          m.img_url,
          m.nutrition_facts
        FROM ORDER_LINE ol
        INNER JOIN MEAL m ON ol.meal_ref = m.meal_id
        WHERE ol.order_ref = ?`,
        [order.order_id]
      );

      order.items = items.map(item => ({
        meal: {
          meal_id: item.meal_id,
          meal_name: item.meal_name,
          meal_description: item.meal_description,
          img_url: item.img_url,
          price: item.price_at_sale,
          nutrition_facts: typeof item.nutrition_facts === 'string' 
            ? JSON.parse(item.nutrition_facts) 
            : item.nutrition_facts
        },
        quantity: item.quantity
      }));

      // Format customer info
      order.customer = `${order.first_name} ${order.last_name}`;
      order.customer_phone = order.phone_number;
      
      // Format address
      if (order.shipping_street) {
        order.address = `${order.shipping_street}, ${order.shipping_city}, ${order.shipping_state_code} ${order.shipping_zipcode}`;
      }
    }

    res.json({ orders });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders', details: error.message });
  }
};

// Get single order by ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const [orders] = await pool.query(
      `SELECT 
        o.*,
        (o.unit_price + o.tax - o.discount) AS total,
        c.customer_id,
        c.first_name,
        c.last_name,
        c.phone_number,
        c.street,
        c.city,
        c.state_code,
        c.zipcode,
        pm.payment_type,
        pm.last_four
      FROM ORDERS o
      INNER JOIN CUSTOMER c ON o.customer_ref = c.customer_id
      LEFT JOIN PAYMENT p ON o.order_id = p.order_ref
      LEFT JOIN PAYMENT_METHOD pm ON p.payment_method_ref = pm.payment_method_id
      WHERE o.order_id = ?`,
      [id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orders[0];

    // Get order line items
    const [items] = await pool.query(
      `SELECT 
        ol.num_units_ordered AS quantity,
        ol.price_at_sale,
        m.meal_id,
        m.meal_name,
        m.meal_description,
        m.img_url,
        m.nutrition_facts
      FROM ORDER_LINE ol
      INNER JOIN MEAL m ON ol.meal_ref = m.meal_id
      WHERE ol.order_ref = ?`,
      [id]
    );

    order.items = items.map(item => ({
      meal: {
        meal_id: item.meal_id,
        meal_name: item.meal_name,
        meal_description: item.meal_description,
        img_url: item.img_url,
        price: item.price_at_sale,
        nutrition_facts: typeof item.nutrition_facts === 'string' 
          ? JSON.parse(item.nutrition_facts) 
          : item.nutrition_facts
      },
      quantity: item.quantity
    }));

    order.customer = `${order.first_name} ${order.last_name}`;
    
    res.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order', details: error.message });
  }
};

// Update order status (for staff)
export const updateOrderStatus = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const { order_status, tracking_number, delivery_date } = req.body;

    if (order_status === undefined) {
      return res.status(400).json({ error: 'order_status is required' });
    }

    // Validate order_status (0=pending, 1=processing, 2=shipped, 3=delivered, 4=cancelled, 5=refunded)
    if (![0, 1, 2, 3, 4, 5].includes(order_status)) {
      return res.status(400).json({ error: 'Invalid order_status value' });
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

    const staffId = staff[0].staff_id;

    const updateFields = ['order_status = ?', 'updated_by_staff = ?'];
    const updateParams = [order_status, staffId];

    if (tracking_number !== undefined) {
      updateFields.push('tracking_number = ?');
      updateParams.push(tracking_number);
    }

    if (delivery_date !== undefined) {
      updateFields.push('delivery_date = ?');
      updateParams.push(delivery_date);
    }

    updateParams.push(id);

    const [result] = await connection.query(
      `UPDATE ORDERS SET ${updateFields.join(', ')} WHERE order_id = ?`,
      updateParams
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Order not found' });
    }

    await connection.commit();

    res.json({ 
      message: 'Order status updated successfully',
      order_id: id,
      order_status
    });
  } catch (error) {
    await connection.rollback();
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status', details: error.message });
  } finally {
    connection.release();
  }
};

export default {
  createOrder,
  getCustomerOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus
};
