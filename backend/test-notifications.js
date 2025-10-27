// Test script for real-time notification system
import https from 'https';
import http from 'http';
import { io } from 'socket.io-client';

const BASE_URL = 'http://localhost:3001';

const makeRequest = (path, method = 'GET', body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

console.log('🔔 Testing Real-Time Notification System\n');

// Test 1: Health Check
console.log('1. Testing server health...');
const healthCheck = await makeRequest('/api/health');
console.log(`   Status: ${healthCheck.status}`);
console.log(`   Response:`, healthCheck.data);
console.log('');

// Test 2: Login as admin to get token
console.log('2. Logging in as admin...');
const adminLogin = await makeRequest('/api/auth/login', 'POST', { username: 'admin', password: 'admin' });
console.log(`   Status: ${adminLogin.status}`);
if (adminLogin.status !== 200) {
  console.error('Failed to login as admin');
  process.exit(1);
}
const adminToken = adminLogin.data.token;
console.log('   ✅ Admin login successful\n');

// Test 3: Login as customer
console.log('3. Logging in as customer...');
const customerLogin = await makeRequest('/api/auth/login', 'POST', { username: 'testuser', password: 'testpass123' });
console.log(`   Status: ${customerLogin.status}`);
let customerToken = null;
let customerId = null;

if (customerLogin.status === 200) {
  customerToken = customerLogin.data.token;
  customerId = customerLogin.data.user.id;
  console.log('   ✅ Customer login successful\n');
} else {
  console.log('   ⚠️ Customer login failed, will create test customer\n');

  // Create test customer
  console.log('   Creating test customer...');
  const registerData = {
    username: 'testuser',
    email: 'testuser@test.com',
    password: 'testpass123',
    firstName: 'Test',
    lastName: 'User'
  };
  const registerResult = await makeRequest('/api/auth/register', 'POST', registerData);
  console.log(`   Register Status: ${registerResult.status}`);

  if (registerResult.status === 201) {
    customerToken = registerResult.data.token;
    customerId = registerResult.data.user.id;
    console.log('   ✅ Test customer created and logged in\n');
  } else {
    console.log('   ❌ Failed to create test customer\n');
  }
}

// Test 4: WebSocket Connection Test
console.log('4. Testing WebSocket connection...');
const socket = io(BASE_URL, {
  autoConnect: false,
  withCredentials: true,
});

let connectionSuccessful = false;
let notificationReceived = false;
let orderNotificationReceived = false;

socket.on('connect', () => {
  console.log('   ✅ WebSocket connected');
  connectionSuccessful = true;

  // Authenticate as customer
  if (customerId) {
    socket.emit('authenticate', customerId);
    console.log(`   👤 Authenticated as user ${customerId}`);
  }
});

socket.on('disconnect', () => {
  console.log('   🔌 WebSocket disconnected');
});

socket.on('notification', (data) => {
  console.log('   📢 Received notification:', data);
  notificationReceived = true;
});

socket.on('order_notification', (data) => {
  console.log('   📦 Received order notification:', data);
  orderNotificationReceived = true;
});

socket.connect();

// Wait for connection
await new Promise(resolve => setTimeout(resolve, 2000));

if (!connectionSuccessful) {
  console.log('   ❌ WebSocket connection failed\n');
} else {
  console.log('   ✅ WebSocket connection successful\n');
}

// Test 5: Create a test order
console.log('5. Creating test order...');
let testOrderId = null;
if (customerToken) {
  const orderData = {
    items: [
      { meal_id: 1, quantity: 2, price_at_sale: 12.99 }
    ],
    total: 25.98,
    tax: 2.08,
    unitPrice: 23.90,
    discount: 0,
    shippingAddress: {
      street: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zipcode: '12345'
    },
    notes: 'Test order for notifications'
  };

  const orderResult = await makeRequest('/api/orders', 'POST', orderData, customerToken);
  console.log(`   Order Creation Status: ${orderResult.status}`);
  if (orderResult.status === 201) {
    testOrderId = orderResult.data.order.id;
    console.log(`   ✅ Test order created with ID: ${testOrderId}\n`);
  } else {
    console.log('   ❌ Failed to create test order\n');
  }
}

// Test 6: Update order status to trigger notifications
console.log('6. Testing order status updates (notifications)...');
if (testOrderId && adminToken) {
  // Update to shipped
  console.log('   Updating order to SHIPPED...');
  const shipResult = await makeRequest(`/api/orders/${testOrderId}/status`, 'PUT', { orderStatus: 2 }, adminToken);
  console.log(`   Ship Status: ${shipResult.status}`);

  // Wait for notification
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Update to delivered
  console.log('   Updating order to DELIVERED...');
  const deliverResult = await makeRequest(`/api/orders/${testOrderId}/status`, 'PUT', { orderStatus: 1 }, adminToken);
  console.log(`   Deliver Status: ${deliverResult.status}`);

  // Wait for notification
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('');
}

// Test 7: Test low stock alerts
console.log('7. Testing low stock alerts...');
if (adminToken) {
  // Get current stocks
  const stocksResult = await makeRequest('/api/stocks', 'GET', null, adminToken);
  if (stocksResult.status === 200 && stocksResult.data.length > 0) {
    const firstStock = stocksResult.data[0];
    console.log(`   Testing with stock ID: ${firstStock.stock_id}`);

    // Update stock to trigger low stock alert
    const updateData = {
      quantity_in_stock: firstStock.reorder_threshold - 1, // Below threshold
      reorder_threshold: firstStock.reorder_threshold,
      max_stock: firstStock.max_stock
    };

    const updateResult = await makeRequest(`/api/stocks/${firstStock.stock_id}`, 'PUT', updateData, adminToken);
    console.log(`   Stock Update Status: ${updateResult.status}`);

    // Wait for notification
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Test 8: Clean up
console.log('8. Cleaning up...');
socket.disconnect();

// Summary
console.log('\n📊 Test Summary:');
console.log(`   WebSocket Connection: ${connectionSuccessful ? '✅' : '❌'}`);
console.log(`   General Notifications: ${notificationReceived ? '✅' : '⚠️'}`);
console.log(`   Order Notifications: ${orderNotificationReceived ? '✅' : '⚠️'}`);
console.log(`   Test Order Created: ${testOrderId ? '✅' : '❌'}`);

console.log('\nAll notification tests completed!');

// Exit after a brief delay to allow cleanup
setTimeout(() => process.exit(0), 1000);