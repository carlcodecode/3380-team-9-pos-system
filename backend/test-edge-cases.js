// Test script for backend edge cases and missing test coverage
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

console.log('Testing Backend Edge Cases and Missing Coverage\n');

// Helper function to get tokens
const getTokens = async () => {
  const customerLogin = await makeRequest('/api/auth/login', 'POST', { username: 'customer1', password: 'customer1' });
  const staffLogin = await makeRequest('/api/auth/login', 'POST', { username: 'staff', password: 'staff' });
  const adminLogin = await makeRequest('/api/auth/login', 'POST', { username: 'admin', password: 'admin' });

  return {
    customer: customerLogin.data?.token,
    staff: staffLogin.data?.token,
    admin: adminLogin.data?.token
  };
};

(async () => {
  const tokens = await getTokens();

  // ===== LOGOUT ENDPOINT =====
  console.log('1. Testing POST /api/auth/logout...');
  if (tokens.customer) {
    const logoutResult = await makeRequest('/api/auth/logout', 'POST', null, tokens.customer);
    console.log(`   Status: ${logoutResult.status}`);
    console.log(`   Response:`, logoutResult.data);
  } else {
    console.log('   Could not get customer token for logout test');
  }
  console.log('');

  // ===== CROSS-ROLE ACCESS CONTROL =====
  console.log('2. Testing cross-role access control...');

  // Staff trying to access admin routes
  console.log('   2a. Staff accessing /api/admin/staff (should fail)...');
  if (tokens.staff) {
    const staffAccessAdmin = await makeRequest('/api/admin/staff', 'GET', null, tokens.staff);
    console.log(`       Status: ${staffAccessAdmin.status}`);
    console.log(`       Response:`, staffAccessAdmin.data);
  }

  // Customer trying to access staff routes
  console.log('   2b. Customer accessing /api/meals (should fail)...');
  if (tokens.customer) {
    const customerAccessMeals = await makeRequest('/api/meals', 'GET', null, tokens.customer);
    console.log(`       Status: ${customerAccessMeals.status}`);
    console.log(`       Response:`, customerAccessMeals.data);
  }

  // Admin trying to access meal routes (should work since admin has staff role)
  console.log('   2c. Admin accessing /api/meals (should work)...');
  if (tokens.admin) {
    const adminAccessMeals = await makeRequest('/api/meals', 'GET', null, tokens.admin);
    console.log(`       Status: ${adminAccessMeals.status}`);
    console.log(`       Response:`, adminAccessMeals.data ? 'Success' : 'Response received');
  }
  console.log('');

  // ===== AUTHENTICATION MIDDLEWARE EDGE CASES =====
  console.log('3. Testing authentication middleware edge cases...');

  // Invalid token format
  console.log('   3a. Invalid token format...');
  const invalidTokenResult = await makeRequest('/api/auth/me', 'GET', null, 'invalid-token');
  console.log(`       Status: ${invalidTokenResult.status}`);
  console.log(`       Response:`, invalidTokenResult.data);

  // Malformed Bearer token
  console.log('   3b. Malformed Bearer token...');
  const malformedBearerResult = await makeRequest('/api/auth/me', 'GET', null, 'Bearer invalid');
  console.log(`       Status: ${malformedBearerResult.status}`);
  console.log(`       Response:`, malformedBearerResult.data);

  // No Bearer prefix
  console.log('   3c. Token without Bearer prefix...');
  const noBearerResult = await makeRequest('/api/auth/me', 'GET', null, 'justatoken');
  console.log(`       Status: ${noBearerResult.status}`);
  console.log(`       Response:`, noBearerResult.data);
  console.log('');

  // ===== HTTP METHOD VALIDATION =====
  console.log('4. Testing HTTP method validation...');

  // Unsupported methods on auth routes
  console.log('   4a. PUT on /api/auth/login (should fail)...');
  const putLoginResult = await makeRequest('/api/auth/login', 'PUT');
  console.log(`       Status: ${putLoginResult.status}`);
  console.log(`       Response:`, putLoginResult.data);

  console.log('   4b. DELETE on /api/auth/register (should fail)...');
  const deleteRegisterResult = await makeRequest('/api/auth/register', 'DELETE');
  console.log(`       Status: ${deleteRegisterResult.status}`);
  console.log(`       Response:`, deleteRegisterResult.data);

  // Unsupported methods on protected routes
  console.log('   4c. PATCH on /api/meals (should fail)...');
  if (tokens.staff) {
    const patchMealsResult = await makeRequest('/api/meals', 'PATCH', null, tokens.staff);
    console.log(`       Status: ${patchMealsResult.status}`);
    console.log(`       Response:`, patchMealsResult.data);
  }
  console.log('');

  // ===== 404 ERROR HANDLING =====
  console.log('5. Testing 404 error handling...');

  console.log('   5a. Invalid route pattern...');
  const invalidRouteResult = await makeRequest('/api/nonexistent', 'GET');
  console.log(`       Status: ${invalidRouteResult.status}`);
  console.log(`       Response:`, invalidRouteResult.data);

  console.log('   5b. Invalid meal ID format...');
  if (tokens.staff) {
    const invalidIdResult = await makeRequest('/api/meals/abc', 'GET', null, tokens.staff);
    console.log(`       Status: ${invalidIdResult.status}`);
    console.log(`       Response:`, invalidIdResult.data);
  }

  console.log('   5c. Invalid admin ID format...');
  if (tokens.admin) {
    const invalidAdminIdResult = await makeRequest('/api/admin/staff/abc', 'GET', null, tokens.admin);
    console.log(`       Status: ${invalidAdminIdResult.status}`);
    console.log(`       Response:`, invalidAdminIdResult.data);
  }
  console.log('');

  // ===== REGISTRATION VALIDATION =====
  console.log('6. Testing registration validation...');

  console.log('   6a. Missing required fields...');
  const missingFieldsResult = await makeRequest('/api/auth/register', 'POST', { firstName: 'Test' });
  console.log(`       Status: ${missingFieldsResult.status}`);
  console.log(`       Response:`, missingFieldsResult.data);

  console.log('   6b. Password too short...');
  const shortPasswordResult = await makeRequest('/api/auth/register', 'POST', {
    username: 'testshort',
    email: 'short@test.com',
    password: '123'
  });
  console.log(`       Status: ${shortPasswordResult.status}`);
  console.log(`       Response:`, shortPasswordResult.data);

  console.log('   6c. Duplicate email...');
  const duplicateEmailResult = await makeRequest('/api/auth/register', 'POST', {
    username: 'uniqueuser',
    email: 'testuser@test.com', // Assuming this exists from previous tests
    password: 'testpass123'
  });
  console.log(`       Status: ${duplicateEmailResult.status}`);
  console.log(`       Response:`, duplicateEmailResult.data);

  console.log('   6d. Duplicate username...');
  const duplicateUsernameResult = await makeRequest('/api/auth/register', 'POST', {
    username: 'testuser', // Assuming this exists from previous tests
    email: 'unique@test.com',
    password: 'testpass123'
  });
  console.log(`       Status: ${duplicateUsernameResult.status}`);
  console.log(`       Response:`, duplicateUsernameResult.data);
  console.log('');

  // ===== LOGIN VALIDATION =====
  console.log('7. Testing login validation...');

  console.log('   7a. Missing username...');
  const missingUsernameResult = await makeRequest('/api/auth/login', 'POST', { password: 'test' });
  console.log(`       Status: ${missingUsernameResult.status}`);
  console.log(`       Response:`, missingUsernameResult.data);

  console.log('   7b. Missing password...');
  const missingPasswordResult = await makeRequest('/api/auth/login', 'POST', { username: 'test' });
  console.log(`       Status: ${missingPasswordResult.status}`);
  console.log(`       Response:`, missingPasswordResult.data);

  console.log('   7c. Empty credentials...');
  const emptyCredentialsResult = await makeRequest('/api/auth/login', 'POST', { username: '', password: '' });
  console.log(`       Status: ${emptyCredentialsResult.status}`);
  console.log(`       Response:`, emptyCredentialsResult.data);
  console.log('');

  // ===== CORS PREFLIGHT =====
  console.log('8. Testing CORS preflight requests...');

  console.log('   8a. OPTIONS request to /api/auth/login...');
  const optionsAuthResult = await makeRequest('/api/auth/login', 'OPTIONS');
  console.log(`       Status: ${optionsAuthResult.status}`);
  console.log(`       Headers:`, optionsAuthResult.headers);

  console.log('   8b. OPTIONS request to /api/meals...');
  const optionsMealsResult = await makeRequest('/api/meals', 'OPTIONS');
  console.log(`       Status: ${optionsMealsResult.status}`);
  console.log(`       Headers:`, optionsMealsResult.headers);
  console.log('');

  // ===== JSON PARSING ERRORS =====
  console.log('9. Testing JSON parsing errors...');

  console.log('   9a. Malformed JSON in registration...');
  const malformedJsonResult = await makeRequest('/api/auth/register', 'POST', '{"invalid": json}', null, false);
  console.log(`       Status: ${malformedJsonResult.status}`);
  console.log(`       Response:`, malformedJsonResult.data);

  console.log('   9b. Malformed JSON in login...');
  const malformedLoginJsonResult = await makeRequest('/api/auth/login', 'POST', '{"username": "test", "password":}', null, false);
  console.log(`       Status: ${malformedLoginJsonResult.status}`);
  console.log(`       Response:`, malformedLoginJsonResult.data);
  console.log('');

  console.log('\nAll edge case tests completed!');
})();
