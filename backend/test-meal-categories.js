// Test script for backend meal category endpoints
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
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
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

console.log('Testing Backend Meal Category Endpoints\n');

// Test 1: Login as staff (using existing staff user)
console.log('1. Testing staff login...');
const staffLogin = await makeRequest('/api/auth/login', 'POST', {
  username: 'staff',
  password: 'staff',
});
console.log(`   Status: ${staffLogin.status}`);
console.log(`   Response:`, staffLogin.data);
console.log('');

if (!staffLogin.data.token) {
  console.error('Failed to login as staff. Cannot proceed with tests.');
  process.exit(1);
}

const staffToken = staffLogin.data.token;

// Test 2: Get all meal categories (should be empty initially)
console.log('2. Testing GET /api/meal-categories (get all meal categories)...');
const getAllResult = await makeRequest('/api/meal-categories', 'GET', null, staffToken);
console.log(`   Status: ${getAllResult.status}`);
console.log(`   Response:`, getAllResult.data);
console.log('');

// Test 3: Create a new meal category
console.log('3. Testing POST /api/meal-categories (create meal category)...');
const createData = {
  meal_type: 'Test High Protein',
};
const createResult = await makeRequest('/api/meal-categories', 'POST', createData, staffToken);
console.log(`   Status: ${createResult.status}`);
console.log(`   Response:`, createResult.data);
console.log('');

if (createResult.status !== 201) {
  console.error('Failed to create meal category. Cannot proceed with remaining tests.');
  process.exit(1);
}

const mealCategoryId = createResult.data.meal_type_id;

// Test 4: Get all meal categories (should now have 1 category)
console.log('4. Testing GET /api/meal-categories (get all meal categories after creation)...');
const getAllAfterCreateResult = await makeRequest('/api/meal-categories', 'GET', null, staffToken);
console.log(`   Status: ${getAllAfterCreateResult.status}`);
console.log(`   Response:`, getAllAfterCreateResult.data);
console.log('');

// Test 5: Get specific meal category by ID
console.log(`5. Testing GET /api/meal-categories/${mealCategoryId} (get meal category by ID)...`);
const getByIdResult = await makeRequest(
  `/api/meal-categories/${mealCategoryId}`,
  'GET',
  null,
  staffToken,
);
console.log(`   Status: ${getByIdResult.status}`);
console.log(`   Response:`, getByIdResult.data);
console.log('');

// Test 6: Update the meal category
console.log(`6. Testing PUT /api/meal-categories/${mealCategoryId} (update meal category)...`);
const updateData = {
  meal_type: 'Premium High Protein',
};
const updateResult = await makeRequest(
  `/api/meal-categories/${mealCategoryId}`,
  'PUT',
  updateData,
  staffToken,
);
console.log(`   Status: ${updateResult.status}`);
console.log(`   Response:`, updateResult.data);
console.log('');

// Test 7: Create another meal category for testing
console.log('7. Testing POST /api/meal-categories (create second meal category)...');
const createData2 = {
  meal_type: 'Vegan',
};
const createResult2 = await makeRequest('/api/meal-categories', 'POST', createData2, staffToken);
console.log(`   Status: ${createResult2.status}`);
console.log(`   Response:`, createResult2.data);
console.log('');

const mealCategoryId2 = createResult2.data?.meal_type_id;

// Test 8: Get all meal categories (should now have 2 categories)
console.log('8. Testing GET /api/meal-categories (get all meal categories with 2 categories)...');
const getAllFinalResult = await makeRequest('/api/meal-categories', 'GET', null, staffToken);
console.log(`   Status: ${getAllFinalResult.status}`);
console.log(`   Response:`, getAllFinalResult.data);
console.log('');

// Test 9: Error cases - Try to access without authentication
console.log('9. Testing GET /api/meal-categories without authentication...');
const noAuthResult = await makeRequest('/api/meal-categories', 'GET');
console.log(`   Status: ${noAuthResult.status}`);
console.log(`   Response:`, noAuthResult.data);
console.log('');

// Test 10: Error cases - Try to access as customer (not staff)
console.log('10. Testing GET /api/meal-categories as customer...');
const customerLogin = await makeRequest('/api/auth/login', 'POST', {
  username: 'customer1',
  password: 'customer1',
});
if (customerLogin.data.token) {
  const customerToken = customerLogin.data.token;
  const customerAccessResult = await makeRequest(
    '/api/meal-categories',
    'GET',
    null,
    customerToken,
  );
  console.log(`   Status: ${customerAccessResult.status}`);
  console.log(`   Response:`, customerAccessResult.data);
} else {
  console.log('   Could not login as customer, skipping test');
}
console.log('');

// Test 11: Error cases - Try to get non-existent meal category
console.log('11. Testing GET /api/meal-categories/99999 (non-existent ID)...');
const notFoundResult = await makeRequest('/api/meal-categories/99999', 'GET', null, staffToken);
console.log(`   Status: ${notFoundResult.status}`);
console.log(`   Response:`, notFoundResult.data);
console.log('');

// Test 12: Error cases - Try to create meal category with invalid data
console.log('12. Testing POST /api/meal-categories with invalid data (missing required fields)...');
const invalidCreateData = {}; // Missing meal_type
const invalidCreateResult = await makeRequest(
  '/api/meal-categories',
  'POST',
  invalidCreateData,
  staffToken,
);
console.log(`   Status: ${invalidCreateResult.status}`);
console.log(`   Response:`, invalidCreateResult.data);
console.log('');

// Test 13: Error cases - Try to update with empty meal_type
console.log(`13. Testing PUT /api/meal-categories/${mealCategoryId} with empty meal_type...`);
const invalidUpdateData = { meal_type: '' };
const invalidUpdateResult = await makeRequest(
  `/api/meal-categories/${mealCategoryId}`,
  'PUT',
  invalidUpdateData,
  staffToken,
);
console.log(`   Status: ${invalidUpdateResult.status}`);
console.log(`   Response:`, invalidUpdateResult.data);
console.log('');

// Test 14: Delete the first meal category
console.log(
  `14. Testing DELETE /api/meal-categories/${mealCategoryId} (delete first meal category)...`,
);
const deleteResult = await makeRequest(
  `/api/meal-categories/${mealCategoryId}`,
  'DELETE',
  null,
  staffToken,
);
console.log(`   Status: ${deleteResult.status}`);
console.log(`   Response:`, deleteResult.data);
console.log('');

// Test 15: Delete the second meal category
if (mealCategoryId2) {
  console.log(
    `15. Testing DELETE /api/meal-categories/${mealCategoryId2} (delete second meal category)...`,
  );
  const deleteResult2 = await makeRequest(
    `/api/meal-categories/${mealCategoryId2}`,
    'DELETE',
    null,
    staffToken,
  );
  console.log(`   Status: ${deleteResult2.status}`);
  console.log(`   Response:`, deleteResult2.data);
  console.log('');
}

// Test 16: Verify all meal categories are deleted
console.log('16. Testing GET /api/meal-categories (verify all meal categories deleted)...');
const finalGetAllResult = await makeRequest('/api/meal-categories', 'GET', null, staffToken);
console.log(`   Status: ${finalGetAllResult.status}`);
console.log(`   Response:`, finalGetAllResult.data);

console.log('\nAll meal category endpoint tests completed!');
