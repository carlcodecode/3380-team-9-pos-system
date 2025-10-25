// Test script for backend meal endpoints
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

console.log('Testing Backend Meal Endpoints\n');

// Test 1: Login as staff (using existing staff user)
console.log('1. Testing staff login...');
const staffLogin = await makeRequest('/api/auth/login', 'POST', { username: 'staff', password: 'staff' });
console.log(`   Status: ${staffLogin.status}`);
console.log(`   Response:`, staffLogin.data);
console.log('');

if (!staffLogin.data.token) {
	console.error('Failed to login as staff. Cannot proceed with tests.');
	process.exit(1);
}

const staffToken = staffLogin.data.user_id;

// Test 2: Get all meals (should be empty initially)
console.log('2. Testing GET /api/meals (get all meals)...');
const getAllResult = await makeRequest('/api/meals', 'GET', null, staffToken);
console.log(`   Status: ${getAllResult.status}`);
console.log(`   Response:`, getAllResult.data);
console.log('');

// Test 3: Create a new meal
console.log('3. Testing POST /api/meals (create meal)...');
const createData = {
	meal_name: 'Test Mediterranean Bowl',
	meal_description: 'A delicious test meal with grilled chicken, quinoa, and vegetables',
	meal_status: 1,
	nutrition_facts: {
		calories: 520,
		protein: 38,
		carbs: 45,
		fat: 18
	},
	start_date: '2025-01-01',
	end_date: '2025-12-31',
	price: 1299,
	cost_to_make: 800,
	meal_types: ['High Protein', 'Gluten-Free']
};
const createResult = await makeRequest('/api/meals', 'POST', createData, staffToken);
console.log(`   Status: ${createResult.status}`);
console.log(`   Response:`, createResult.data);
console.log('');

if (createResult.status !== 200) {
	console.error('Failed to create meal. Cannot proceed with remaining tests.');
	process.exit(1);
}

const mealId = createResult.data.meal_id;

// Test 4: Get all meals (should now have 1 meal)
console.log('4. Testing GET /api/meals (get all meals after creation)...');
const getAllAfterCreateResult = await makeRequest('/api/meals', 'GET', null, staffToken);
console.log(`   Status: ${getAllAfterCreateResult.status}`);
console.log(`   Response:`, getAllAfterCreateResult.data);
console.log('');

// Test 5: Get specific meal by ID
console.log(`5. Testing GET /api/meals/${mealId} (get meal by ID)...`);
const getByIdResult = await makeRequest(`/api/meals/${mealId}`, 'GET', null, staffToken);
console.log(`   Status: ${getByIdResult.status}`);
console.log(`   Response:`, getByIdResult.data);
console.log('');

// Test 6: Update the meal
console.log(`6. Testing PUT /api/meals/${mealId} (update meal)...`);
const updateData = {
	meal_name: 'Updated Test Mediterranean Bowl',
	price: 1399,
	nutrition_facts: {
		calories: 550,
		protein: 40,
		carbs: 50,
		fat: 20
	},
	meal_types: ['High Protein', 'Gluten-Free', 'Updated']
};
const updateResult = await makeRequest(`/api/meals/${mealId}`, 'PUT', updateData, staffToken);
console.log(`   Status: ${updateResult.status}`);
console.log(`   Response:`, updateResult.data);
console.log('');

// Test 7: Create another meal for testing
console.log('7. Testing POST /api/meals (create second meal)...');
const createData2 = {
	meal_name: 'Test Vegan Salad',
	meal_description: 'Fresh greens and chickpeas',
	meal_status: 1,
	nutrition_facts: {
		calories: 380,
		protein: 12,
		carbs: 32,
		fat: 22
	},
	start_date: '2025-01-01',
	end_date: '2025-12-31',
	price: 1099,
	cost_to_make: 600,
	meal_types: ['Vegan', 'Low Calorie']
};
const createResult2 = await makeRequest('/api/meals', 'POST', createData2, staffToken);
console.log(`   Status: ${createResult2.status}`);
console.log(`   Response:`, createResult2.data);
console.log('');

const mealId2 = createResult2.data?.meal?.meal_id;

// Test 8: Get all meals (should now have 2 meals)
console.log('8. Testing GET /api/meals (get all meals with 2 meals)...');
const getAllFinalResult = await makeRequest('/api/meals', 'GET', null, staffToken);
console.log(`   Status: ${getAllFinalResult.status}`);
console.log(`   Response:`, getAllFinalResult.data);
console.log('');

// Test 9: Error cases - Try to access without authentication
console.log('9. Testing GET /api/meals without authentication...');
const noAuthResult = await makeRequest('/api/meals', 'GET');
console.log(`   Status: ${noAuthResult.status}`);
console.log(`   Response:`, noAuthResult.data);
console.log('');

// Test 10: Error cases - Try to access as customer (not staff)
console.log('10. Testing GET /api/meals as customer...');
const customerLogin = await makeRequest('/api/auth/login', 'POST', { username: 'customer1', password: 'customer1' });
if (customerLogin.data.token) {
	const customerToken = customerLogin.data.token;
	const customerAccessResult = await makeRequest('/api/meals', 'GET', null, customerToken);
	console.log(`   Status: ${customerAccessResult.status}`);
	console.log(`   Response:`, customerAccessResult.data);
} else {
	console.log('   Could not login as customer, skipping test');
}
console.log('');

// Test 11: Error cases - Try to get non-existent meal
console.log('11. Testing GET /api/meals/99999 (non-existent ID)...');
const notFoundResult = await makeRequest('/api/meals/99999', 'GET', null, staffToken);
console.log(`   Status: ${notFoundResult.status}`);
console.log(`   Response:`, notFoundResult.data);
console.log('');

// Test 12: Error cases - Try to create meal with invalid data
console.log('12. Testing POST /api/meals with invalid data (missing required fields)...');
const invalidCreateData = { meal_name: 'Invalid Meal' }; // Missing required fields
const invalidCreateResult = await makeRequest('/api/meals', 'POST', invalidCreateData, staffToken);
console.log(`   Status: ${invalidCreateResult.status}`);
console.log(`   Response:`, invalidCreateResult.data);
console.log('');

// Test 13: Error cases - Try to update with negative price
console.log(`13. Testing PUT /api/meals/${mealId} with negative price...`);
const invalidUpdateData = { price: -100 };
const invalidUpdateResult = await makeRequest(`/api/meals/${mealId}`, 'PUT', invalidUpdateData, staffToken);
console.log(`   Status: ${invalidUpdateResult.status}`);
console.log(`   Response:`, invalidUpdateResult.data);
console.log('');

// Test 14: Delete the first meal
console.log(`14. Testing DELETE /api/meals/${mealId} (delete first meal)...`);
const deleteResult = await makeRequest(`/api/meals/${mealId}`, 'DELETE', null, staffToken);
console.log(`   Status: ${deleteResult.status}`);
console.log(`   Response:`, deleteResult.data);
console.log('');

// Test 15: Delete the second meal
if (mealId2) {
	console.log(`15. Testing DELETE /api/meals/${mealId2} (delete second meal)...`);
	const deleteResult2 = await makeRequest(`/api/meals/${mealId2}`, 'DELETE', null, staffToken);
	console.log(`   Status: ${deleteResult2.status}`);
	console.log(`   Response:`, deleteResult2.data);
	console.log('');
}

// Test 16: Verify all meals are deleted
console.log('16. Testing GET /api/meals (verify all meals deleted)...');
const finalGetAllResult = await makeRequest('/api/meals', 'GET', null, staffToken);
console.log(`   Status: ${finalGetAllResult.status}`);
console.log(`   Response:`, finalGetAllResult.data);

console.log('\nAll meal endpoint tests completed!');
