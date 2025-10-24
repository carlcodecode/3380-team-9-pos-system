// Test script for backend auth endpoints
import https from 'https';
import http from 'http';

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

console.log('🧪 Testing Backend Auth Endpoints\n');

// Test 1: Health Check
console.log('1. Testing /api/health...');
const healthCheck = await makeRequest('/api/health');
console.log(`   Status: ${healthCheck.status}`);
console.log(`   Response:`, healthCheck.data);
console.log('');

// Test 2: Register a new customer
console.log('2. Testing POST /api/auth/register...');
const registerData = {
  username: 'testuser',
  email: 'testuser@test.com',
  password: 'testpass123',
  firstName: 'Test',
  lastName: 'User'
};
const registerResult = await makeRequest('/api/auth/register', 'POST', registerData);
console.log(`   Status: ${registerResult.status}`);
console.log(`   Response:`, registerResult.data);
console.log('');

// Test 3: Login with the new user
console.log('3. Testing POST /api/auth/login...');
const loginData = { username: 'testuser', password: 'testpass123' };
const loginResult = await makeRequest('/api/auth/login', 'POST', loginData);
console.log(`   Status: ${loginResult.status}`);
console.log(`   Response:`, loginResult.data);
console.log('');

// Test 4: Get current user (protected route)
if (loginResult.data.token) {
  console.log('4. Testing GET /api/auth/me (protected)...');
  const meResult = await makeRequest('/api/auth/me', 'GET', null, loginResult.data.token);
  console.log(`   Status: ${meResult.status}`);
  console.log(`   Response:`, meResult.data);
  console.log('');
}

// Test 5: Login with admin
console.log('5. Testing admin login...');
const adminLogin = await makeRequest('/api/auth/login', 'POST', { username: 'admin', password: 'admin' });
console.log(`   Status: ${adminLogin.status}`);
console.log(`   Response:`, adminLogin.data);

console.log('\nAll tests completed!');
