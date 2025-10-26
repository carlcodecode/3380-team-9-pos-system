import pool from '../config/database.js';

// Master staff ID for system-generated orders (customer self-service orders)
// This should be a valid staff_id in your STAFF table
const SYSTEM_STAFF_ID = 1; // Change this to match your system/master staff ID in the database

// Get all orders (for staff/admin)
export const getAllOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT 
        o.order_id,
        o.customer_ref,
        o.order_date,
        o.order_status,
        o.delivery_date,
        o.unit_price,
        o.tax,
        o.discount,
        o.notes,
        o.refund_message,
        o.shipping_street,
        o.shipping_city,
        o.shipping_state_code,
        o.shipping_zipcode,
        o.created_by,
        o.created_at,
        o.updated_by_staff,
        o.updated_by_customer,
        o.last_updated_at,
        o.tracking_number,
        c.first_name,
        c.last_name,
        u.email
       FROM ORDERS o
       JOIN CUSTOMER c ON o.customer_ref = c.customer_id
       JOIN USER_ACCOUNT u ON c.user_ref = u.user_id
       ORDER BY o.created_at DESC`
    );

    // Fetch order line items for all orders
    const orderIds = orders.map(o => o.order_id);
    let orderLines = [];
    
    if (orderIds.length > 0) {
      const [lines] = await pool.query(
        `SELECT 
          ol.order_ref,
          ol.meal_ref,
          ol.num_units_ordered,
          ol.price_at_sale,
          ol.cost_per_unit,
          m.meal_name,
          m.meal_description,
          m.img_url
         FROM ORDER_LINE ol
         JOIN MEAL m ON ol.meal_ref = m.meal_id
         WHERE ol.order_ref IN (?)`,
        [orderIds]
      );
      orderLines = lines;
    }

    res.json({
      orders: orders.map(order => ({
        id: order.order_id,
        customerId: order.customer_ref,
        customerName: `${order.first_name} ${order.last_name}`,
        customerEmail: order.email,
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
        lastUpdatedAt: order.last_updated_at,
        items: orderLines
          .filter(line => line.order_ref === order.order_id)
          .map(line => ({
            mealId: line.meal_ref,
            mealName: line.meal_name,
            mealDescription: line.meal_description,
            imageUrl: line.img_url,
            quantity: line.num_units_ordered,
            priceAtSale: line.price_at_sale / 100,
            costPerUnit: line.cost_per_unit / 100,
            totalPrice: (line.price_at_sale * line.num_units_ordered) / 100
          }))
      }))
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
};

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

    // Fetch order line items for all orders
    const orderIds = orders.map(o => o.order_id);
    let orderLines = [];
    
    if (orderIds.length > 0) {
      const [lines] = await pool.query(
        `SELECT 
          ol.order_ref,
          ol.meal_ref,
          ol.num_units_ordered,
          ol.price_at_sale,
          ol.cost_per_unit,
          m.meal_name,
          m.meal_description,
          m.img_url
         FROM ORDER_LINE ol
         JOIN MEAL m ON ol.meal_ref = m.meal_id
         WHERE ol.order_ref IN (?)`,
        [orderIds]
      );
      orderLines = lines;
    }

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
        lastUpdatedAt: order.last_updated_at,
        items: orderLines
          .filter(line => line.order_ref === order.order_id)
          .map(line => ({
            mealId: line.meal_ref,
            mealName: line.meal_name,
            mealDescription: line.meal_description,
            imageUrl: line.img_url,
            quantity: line.num_units_ordered,
            priceAtSale: line.price_at_sale / 100,
            costPerUnit: line.cost_per_unit / 100,
            totalPrice: (line.price_at_sale * line.num_units_ordered) / 100
          }))
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

    // Fetch order line items
    const [orderLines] = await pool.query(
      `SELECT 
        ol.order_ref,
        ol.meal_ref,
        ol.num_units_ordered,
        ol.price_at_sale,
        ol.cost_per_unit,
        m.meal_name,
        m.meal_description,
        m.img_url
       FROM ORDER_LINE ol
       JOIN MEAL m ON ol.meal_ref = m.meal_id
       WHERE ol.order_ref = ?`,
      [orderId]
    );

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
        lastUpdatedAt: order.last_updated_at,
        items: orderLines.map(line => ({
          mealId: line.meal_ref,
          mealName: line.meal_name,
          mealDescription: line.meal_description,
          imageUrl: line.img_url,
          quantity: line.num_units_ordered,
          priceAtSale: line.price_at_sale / 100,
          costPerUnit: line.cost_per_unit / 100,
          totalPrice: (line.price_at_sale * line.num_units_ordered) / 100
        }))
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
    console.log('Create order request received');
    console.log('User from token:', req.user);
    console.log('Request body:', req.body);
    
    const customerId = req.user.customerId;
    const userId = req.user.userId;
    
    if (!customerId) {
      console.error('No customerId found in token');
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
      trackingNumber,
      cartItems, // Array of { mealId, quantity, price, cost }
      paymentMethodId // Payment method used for this order
    } = req.body;

    // Validation
    if (!orderDate || unitPrice === undefined || tax === undefined) {
      console.error('Missing required fields');
      return res.status(400).json({ 
        error: 'Order date, unit price, and tax are required' 
      });
    }

    // Validate cart items
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      console.error('Cart items are required');
      return res.status(400).json({ 
        error: 'Cart items are required to create an order' 
      });
    }

    // Validate payment method
    if (!paymentMethodId) {
      console.error('Payment method is required');
      return res.status(400).json({ 
        error: 'Payment method is required to create an order' 
      });
    }

    // Validate each cart item
    for (const item of cartItems) {
      if (!item.mealId || !item.quantity || item.price === undefined) {
        console.error('Invalid cart item:', item);
        return res.status(400).json({ 
          error: 'Each cart item must have mealId, quantity, and price' 
        });
      }
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

    console.log('Validation passed, inserting order...');
    
    await connection.beginTransaction();

    // Insert the order
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

    const orderId = result.insertId;
    console.log('Order inserted with ID:', orderId);

    // Insert order line items and update stock
    console.log('Inserting order line items and updating stock...');
    for (const item of cartItems) {
      // Fetch meal cost and current stock from database
      const [meals] = await connection.query(
        'SELECT cost_to_make FROM MEAL WHERE meal_id = ?',
        [item.mealId]
      );

      if (meals.length === 0) {
        await connection.rollback();
        return res.status(400).json({ 
          error: `Meal with ID ${item.mealId} not found` 
        });
      }

      const costPerUnit = meals[0].cost_to_make;

      // Check if stock exists for this meal
      const [stockCheck] = await connection.query(
        `SELECT 
          s.stock_id, 
          s.quantity_in_stock, 
          m.meal_name
        FROM STOCK s
        JOIN MEAL m ON s.meal_ref = m.meal_id
        WHERE s.meal_ref = ? FOR UPDATE`,
        [item.mealId]
      );

      if (stockCheck.length === 0) {
        await connection.rollback();
        return res.status(400).json({ 
          error: `Stock not found for meal ID ${item.mealId}` 
        });
      }

      const currentStock = stockCheck[0].quantity_in_stock;
      const stockId = stockCheck[0].stock_id;

      // Check if we have enough stock
      if (currentStock < item.quantity) {
        await connection.rollback();
        return res.status(400).json({ 
          error: `Insufficient stock for meal ID ${stockCheck[0].meal_name}. Available: ${currentStock}, Requested: ${item.quantity}` 
        });
      }

      // Insert order line item
      await connection.query(
        `INSERT INTO ORDER_LINE 
         (order_ref, meal_ref, num_units_ordered, price_at_sale, cost_per_unit)
         VALUES (?, ?, ?, ?, ?)`,
        [
          orderId,
          item.mealId,
          item.quantity,
          item.price, // Price should already be in cents
          costPerUnit
        ]
      );

      console.log(`Inserted order line: meal ${item.mealId}, qty ${item.quantity}`);

      // Update stock - subtract the ordered quantity
      await connection.query(
        'UPDATE STOCK SET quantity_in_stock = quantity_in_stock - ? WHERE stock_id = ?',
        [item.quantity, stockId]
      );

      console.log(`📦 Updated stock for meal ${item.mealId}: decreased by ${item.quantity}`);
    }

    // Verify payment method exists and belongs to customer
    const [paymentMethods] = await connection.query(
      'SELECT payment_method_id FROM PAYMENT_METHOD WHERE payment_method_id = ? AND customer_ref = ?',
      [paymentMethodId, customerId]
    );

    if (paymentMethods.length === 0) {
      await connection.rollback();
      return res.status(400).json({ 
        error: 'Invalid payment method or payment method does not belong to customer' 
      });
    }

    // Calculate total payment amount (unit_price + tax - discount)
    const totalAmount = unitPrice + tax - (discount || 0);

    // Insert payment record
    await connection.query(
      `INSERT INTO PAYMENT 
       (order_ref, payment_method_ref, payment_amount, payment_datetime, 
        transaction_status, created_by)
       VALUES (?, ?, ?, NOW(), ?, ?)`,
      [
        orderId,
        paymentMethodId,
        totalAmount, // Amount in cents
        1, // transaction_status: 1 = successful (assuming payment succeeded)
        SYSTEM_STAFF_ID // created_by references STAFF table - use system staff ID
      ]
    );

    console.log(`Payment record created for order ${orderId} using payment method ${paymentMethodId}`);
    
    await connection.commit();

    // Fetch the created order with line items
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
      [orderId]
    );

    const order = orders[0];

    // Fetch order line items
    const [orderLines] = await pool.query(
      `SELECT 
        ol.order_ref,
        ol.meal_ref,
        ol.num_units_ordered,
        ol.price_at_sale,
        ol.cost_per_unit,
        m.meal_name,
        m.meal_description,
        m.img_url
       FROM ORDER_LINE ol
       JOIN MEAL m ON ol.meal_ref = m.meal_id
       WHERE ol.order_ref = ?`,
      [orderId]
    );
    
    console.log('Order created successfully:', order.order_id);

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
        createdAt: order.created_at,
        items: orderLines.map(line => ({
          mealId: line.meal_ref,
          mealName: line.meal_name,
          mealDescription: line.meal_description,
          imageUrl: line.img_url,
          quantity: line.num_units_ordered,
          priceAtSale: line.price_at_sale / 100,
          costPerUnit: line.cost_per_unit / 100,
          totalPrice: (line.price_at_sale * line.num_units_ordered) / 100
        }))
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

// Update order status (staff only)
export const updateOrderStatus = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const staffId = req.user.staffId;
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    if (!staffId) {
      return res.status(403).json({ 
        error: 'Only staff members can update order status' 
      });
    }

    // Validate order status (0-3 based on schema)
    if (orderStatus === undefined || orderStatus < 0 || orderStatus > 3) {
      return res.status(400).json({ 
        error: 'Invalid order status. Must be 0 (processing), 1 (delivered), 2 (shipped), or 3 (refunded)' 
      });
    }

    // Verify order exists
    const [orders] = await pool.query(
      'SELECT order_id FROM ORDERS WHERE order_id = ?',
      [orderId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await connection.beginTransaction();

    await connection.query(
      `UPDATE ORDERS 
       SET order_status = ?,
           updated_by_staff = ?
       WHERE order_id = ?`,
      [orderStatus, staffId, orderId]
    );

    await connection.commit();

    // Fetch updated order
    const [updatedOrders] = await pool.query(
      `SELECT 
        o.order_id,
        o.customer_ref,
        o.order_date,
        o.order_status,
        o.delivery_date,
        o.unit_price,
        o.tax,
        o.discount,
        o.notes,
        o.refund_message,
        o.shipping_street,
        o.shipping_city,
        o.shipping_state_code,
        o.shipping_zipcode,
        o.created_by,
        o.created_at,
        o.updated_by_staff,
        o.updated_by_customer,
        o.last_updated_at,
        o.tracking_number,
        c.first_name,
        c.last_name,
        u.email
       FROM ORDERS o
       JOIN CUSTOMER c ON o.customer_ref = c.customer_id
       JOIN USER_ACCOUNT u ON c.user_ref = u.user_id
       WHERE o.order_id = ?`,
      [orderId]
    );

    const order = updatedOrders[0];

    res.json({
      message: 'Order status updated successfully',
      order: {
        id: order.order_id,
        customerId: order.customer_ref,
        customerName: `${order.first_name} ${order.last_name}`,
        customerEmail: order.email,
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
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status', details: error.message });
  } finally {
    connection.release();
  }
};
