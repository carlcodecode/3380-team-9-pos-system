import pool from '../config/database.js';

// Master staff ID for system-generated orders (customer self-service orders)
// This should be a valid staff_id in your STAFF table
const SYSTEM_STAFF_ID = 1; // Change this to match your system/master staff ID in the database

// Get customer order history
export const getCustomerOrders = async (req, res) => {
  try {
    const customerId = req.user.customerId;

    const [orders] = await pool.query(
      `SELECT 
        order_id,
        customer_ref,
        order_date,
        order_status,
        delivery_date,
        unit_price,
        tax,
        discount,
        notes,
        refund_message,
        shipping_street,
        shipping_city,
        shipping_state_code,
        shipping_zipcode,
        created_by,
        created_at,
        updated_by_staff,
        updated_by_customer,
        last_updated_at,
        tracking_number
       FROM ORDERS
       WHERE customer_ref = ?
       ORDER BY created_at DESC`,
      [customerId]
    );

    res.json({
      orders: orders.map(order => ({
        id: order.order_id,
        customerId: order.customer_ref,
        orderDate: order.order_date,
        orderStatus: order.order_status,
        deliveryDate: order.delivery_date,
        unitPrice: order.unit_price / 100,
        tax: order.tax / 100,
        discount: (order.discount || 0) / 100,
        total: (order.unit_price + order.tax - (order.discount || 0)) / 100,
        notes: order.notes,
        refundMessage: order.refund_message,
        shippingAddress: {
          street: order.shipping_street,
          city: order.shipping_city,
          state: order.shipping_state_code,
          zipcode: order.shipping_zipcode
        },
        trackingNumber: order.tracking_number,
        createdAt: order.created_at,
        lastUpdatedAt: order.last_updated_at
      }))
    });
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
};

// Get single order by ID
export const getOrderById = async (req, res) => {
  try {
    const customerId = req.user.customerId;
    const { orderId } = req.params;

    const [orders] = await pool.query(
      `SELECT 
        order_id,
        customer_ref,
        order_date,
        order_status,
        delivery_date,
        unit_price,
        tax,
        discount,
        notes,
        refund_message,
        shipping_street,
        shipping_city,
        shipping_state_code,
        shipping_zipcode,
        created_by,
        created_at,
        updated_by_staff,
        updated_by_customer,
        last_updated_at,
        tracking_number
       FROM ORDERS
       WHERE order_id = ? AND customer_ref = ?`,
      [orderId, customerId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orders[0];

    res.json({
      order: {
        id: order.order_id,
        customerId: order.customer_ref,
        orderDate: order.order_date,
        orderStatus: order.order_status,
        deliveryDate: order.delivery_date,
        unitPrice: order.unit_price / 100,
        tax: order.tax / 100,
        discount: (order.discount || 0) / 100,
        total: (order.unit_price + order.tax - (order.discount || 0)) / 100,
        notes: order.notes,
        refundMessage: order.refund_message,
        shippingAddress: {
          street: order.shipping_street,
          city: order.shipping_city,
          state: order.shipping_state_code,
          zipcode: order.shipping_zipcode
        },
        trackingNumber: order.tracking_number,
        createdAt: order.created_at,
        lastUpdatedAt: order.last_updated_at
      }
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ error: 'Failed to get order' });
  }
};

// Create new order (after payment)
export const createOrder = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    console.log('🛒 Create order request received');
    console.log('User from token:', req.user);
    console.log('Request body:', req.body);
    
    const customerId = req.user.customerId;
    const userId = req.user.userId;
    
    if (!customerId) {
      console.error('❌ No customerId found in token');
      return res.status(400).json({ 
        error: 'Customer ID not found. Please log in again.' 
      });
    }
    
    const {
      orderDate,
      orderStatus,
      deliveryDate,
      unitPrice,
      tax,
      discount,
      notes,
      shippingStreet,
      shippingCity,
      shippingState,
      shippingZipcode,
      trackingNumber
    } = req.body;

    // Validation
    if (!orderDate || unitPrice === undefined || tax === undefined) {
      console.error('❌ Missing required fields');
      return res.status(400).json({ 
        error: 'Order date, unit price, and tax are required' 
      });
    }

    // Validate state code if provided (must be 2 characters)
    if (shippingState && shippingState.length !== 2) {
      return res.status(400).json({ 
        error: 'State code must be 2 characters (e.g., TX, CA)' 
      });
    }

    // Validate zipcode if provided (must be 5 characters)
    if (shippingZipcode && (shippingZipcode.length !== 5 || !/^\d{5}$/.test(shippingZipcode))) {
      return res.status(400).json({ 
        error: 'Zipcode must be 5 digits' 
      });
    }

    console.log('✅ Validation passed, inserting order...');
    
    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO ORDERS 
       (customer_ref, order_date, order_status, delivery_date, unit_price, tax, 
        discount, notes, shipping_street, shipping_city, shipping_state_code, 
        shipping_zipcode, created_by, tracking_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customerId,
        orderDate,
        orderStatus !== undefined ? orderStatus : 0, // Default to 0 if not provided
        deliveryDate || null,
        unitPrice,
        tax,
        discount || 0,
        notes || null,
        shippingStreet || null,
        shippingCity || null,
        shippingState ? shippingState.toUpperCase() : null,
        shippingZipcode || null,
        SYSTEM_STAFF_ID, // Use master/system staff ID for customer orders
        trackingNumber || null
      ]
    );

    console.log('✅ Order inserted with ID:', result.insertId);
    
    await connection.commit();

    // Fetch the created order
    const [orders] = await pool.query(
      `SELECT 
        order_id,
        customer_ref,
        order_date,
        order_status,
        delivery_date,
        unit_price,
        tax,
        discount,
        notes,
        refund_message,
        shipping_street,
        shipping_city,
        shipping_state_code,
        shipping_zipcode,
        created_by,
        created_at,
        tracking_number
       FROM ORDERS
       WHERE order_id = ?`,
      [result.insertId]
    );

    const order = orders[0];
    
    console.log('✅ Order created successfully:', order.order_id);

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: order.order_id,
        customerId: order.customer_ref,
        orderDate: order.order_date,
        orderStatus: order.order_status,
        deliveryDate: order.delivery_date,
        unitPrice: order.unit_price / 100,
        tax: order.tax / 100,
        discount: (order.discount || 0) / 100,
        total: (order.unit_price + order.tax - (order.discount || 0)) / 100,
        notes: order.notes,
        refundMessage: order.refund_message,
        shippingAddress: {
          street: order.shipping_street,
          city: order.shipping_city,
          state: order.shipping_state_code,
          zipcode: order.shipping_zipcode
        },
        trackingNumber: order.tracking_number,
        createdAt: order.created_at
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('❌ Create order error:', error);
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  } finally {
    connection.release();
  }
};

// Update order (customer can update certain fields)
export const updateOrder = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const customerId = req.user.customerId;
    const userId = req.user.userId;
    const { orderId } = req.params;
    
    const {
      notes,
      shippingStreet,
      shippingCity,
      shippingState,
      shippingZipcode
    } = req.body;

    // Verify order belongs to customer
    const [orders] = await pool.query(
      'SELECT order_id, order_status FROM ORDERS WHERE order_id = ? AND customer_ref = ?',
      [orderId, customerId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Validate state code if provided (must be 2 characters)
    if (shippingState && shippingState.length !== 2) {
      return res.status(400).json({ 
        error: 'State code must be 2 characters (e.g., TX, CA)' 
      });
    }

    // Validate zipcode if provided (must be 5 characters)
    if (shippingZipcode && (shippingZipcode.length !== 5 || !/^\d{5}$/.test(shippingZipcode))) {
      return res.status(400).json({ 
        error: 'Zipcode must be 5 digits' 
      });
    }

    await connection.beginTransaction();

    await connection.query(
      `UPDATE ORDERS 
       SET notes = COALESCE(?, notes),
           shipping_street = COALESCE(?, shipping_street),
           shipping_city = COALESCE(?, shipping_city),
           shipping_state_code = COALESCE(?, shipping_state_code),
           shipping_zipcode = COALESCE(?, shipping_zipcode),
           updated_by_customer = ?
       WHERE order_id = ?`,
      [
        notes,
        shippingStreet,
        shippingCity,
        shippingState ? shippingState.toUpperCase() : null,
        shippingZipcode,
        customerId,
        orderId
      ]
    );

    await connection.commit();

    // Fetch updated order
    const [updatedOrders] = await pool.query(
      `SELECT 
        order_id,
        customer_ref,
        order_date,
        order_status,
        delivery_date,
        unit_price,
        tax,
        discount,
        notes,
        refund_message,
        shipping_street,
        shipping_city,
        shipping_state_code,
        shipping_zipcode,
        created_by,
        created_at,
        updated_by_staff,
        updated_by_customer,
        last_updated_at,
        tracking_number
       FROM ORDERS
       WHERE order_id = ?`,
      [orderId]
    );

    const order = updatedOrders[0];

    res.json({
      message: 'Order updated successfully',
      order: {
        id: order.order_id,
        customerId: order.customer_ref,
        orderDate: order.order_date,
        orderStatus: order.order_status,
        deliveryDate: order.delivery_date,
        unitPrice: order.unit_price / 100,
        tax: order.tax / 100,
        discount: (order.discount || 0) / 100,
        total: (order.unit_price + order.tax - (order.discount || 0)) / 100,
        notes: order.notes,
        refundMessage: order.refund_message,
        shippingAddress: {
          street: order.shipping_street,
          city: order.shipping_city,
          state: order.shipping_state_code,
          zipcode: order.shipping_zipcode
        },
        trackingNumber: order.tracking_number,
        createdAt: order.created_at,
        lastUpdatedAt: order.last_updated_at
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Failed to update order', details: error.message });
  } finally {
    connection.release();
  }
};
