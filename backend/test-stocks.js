// Test script for backend stock endpoints
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

console.log('Testing Backend Stock Endpoints\n');

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

// Test 2: Get all stocks (should be empty initially)
console.log('2. Testing GET /api/stocks (get all stocks)...');
const getAllResult = await makeRequest('/api/stocks', 'GET', null, staffToken);
console.log(`   Status: ${getAllResult.status}`);
console.log(`   Response:`, getAllResult.data);
console.log('');

// Test 3: Create a meal first (needed for stock testing)
console.log('3. Testing POST /api/meals (create meal for stock testing)...');
const createMealData = {
	meal_name: 'Test Stock Meal',
	meal_description: 'A meal for testing stock functionality',
	meal_status: 1,
	nutrition_facts: {
		calories: 400,
		protein: 25,
		carbs: 30,
		fat: 15
	},
	start_date: '2025-01-01',
	end_date: '2025-12-31',
	price: 999,
	cost_to_make: 600,
	meal_types: ['Test']
};
const createMealResult = await makeRequest('/api/meals', 'POST', createMealData, staffToken);
console.log(`   Status: ${createMealResult.status}`);
console.log(`   Response:`, createMealResult.data);
console.log('');

if (createMealResult.status !== 200) {
	console.error('Failed to create meal. Cannot proceed with stock tests.');
	process.exit(1);
}

const mealId = createMealResult.data.meal_id;

// Test 4: Create stock for the meal
console.log('4. Testing POST /api/stocks (create stock - this endpoint might not exist yet)...');
const createStockData = {
	meal_ref: mealId,
	quantity_in_stock: 50,
	reorder_threshold: 10,
	stock_fulfillment_time: 2
};
const createStockResult = await makeRequest('/api/stocks', 'POST', createStockData, staffToken);
console.log(`   Status: ${createStockResult.status}`);
console.log(`   Response:`, createStockResult.data);
console.log('');

// Note: If stock creation endpoint doesn't exist, we'll work with existing stocks
let stockId = null;
if (createStockResult.status === 200) {
	stockId = createStockResult.data.stock_id;
}

// Test 5: Get all stocks (should now have stocks)
console.log('5. Testing GET /api/stocks (get all stocks after creation)...');
const getAllAfterCreateResult = await makeRequest('/api/stocks', 'GET', null, staffToken);
console.log(`   Status: ${getAllAfterCreateResult.status}`);
console.log(`   Response:`, getAllAfterCreateResult.data);
console.log('');

// If we have stocks, test individual operations
if (getAllAfterCreateResult.data && getAllAfterCreateResult.data.length > 0) {
	const testStockId = stockId || getAllAfterCreateResult.data[0].stock_id;

	// Test 6: Get specific stock by ID
	console.log(`6. Testing GET /api/stocks/${testStockId} (get stock by ID)...`);
	const getByIdResult = await makeRequest(`/api/stocks/${testStockId}`, 'GET', null, staffToken);
	console.log(`   Status: ${getByIdResult.status}`);
	console.log(`   Response:`, getByIdResult.data);
	console.log('');

	// Test 7: Update the stock
	console.log(`7. Testing PUT /api/stocks/${testStockId} (update stock)...`);
	const updateData = {
		quantity_in_stock: 75,
		reorder_threshold: 15,
		stock_fulfillment_time: 3
	};
	const updateResult = await makeRequest(`/api/stocks/${testStockId}`, 'PUT', updateData, staffToken);
	console.log(`   Status: ${updateResult.status}`);
	console.log(`   Response:`, updateResult.data);
	console.log('');

	// Test 8: Update stock to trigger reorder (quantity_in_stock <= reorder_threshold)
	console.log(`8. Testing PUT /api/stocks/${testStockId} (update stock to trigger reorder)...`);
	const reorderData = {
		quantity_in_stock: 10,
		reorder_threshold: 15,
		stock_fulfillment_time: 3
	};
	const reorderResult = await makeRequest(`/api/stocks/${testStockId}`, 'PUT', reorderData, staffToken);
	console.log(`   Status: ${reorderResult.status}`);
	console.log(`   Response:`, reorderResult.data);
	console.log('');
}

// Test 9: Error cases - Try to access without authentication
console.log('9. Testing GET /api/stocks without authentication...');
const noAuthResult = await makeRequest('/api/stocks', 'GET');
console.log(`   Status: ${noAuthResult.status}`);
console.log(`   Response:`, noAuthResult.data);
console.log('');

// Test 10: Error cases - Try to access as customer (not staff)
console.log('10. Testing GET /api/stocks as customer...');
const customerLogin = await makeRequest('/api/auth/login', 'POST', { username: 'customer1', password: 'customer1' });
if (customerLogin.data.token) {
	const customerToken = customerLogin.data.token;
	const customerAccessResult = await makeRequest('/api/stocks', 'GET', null, customerToken);
	console.log(`   Status: ${customerAccessResult.status}`);
	console.log(`   Response:`, customerAccessResult.data);
} else {
	console.log('   Could not login as customer, skipping test');
}
console.log('');

// Test 11: Error cases - Try to get non-existent stock
console.log('11. Testing GET /api/stocks/99999 (non-existent ID)...');
const notFoundResult = await makeRequest('/api/stocks/99999', 'GET', null, staffToken);
console.log(`   Status: ${notFoundResult.status}`);
console.log(`   Response:`, notFoundResult.data);
console.log('');

// Test 12: Error cases - Try to update stock with invalid data
console.log('12. Testing PUT /api/stocks/1 with invalid data (missing required fields)...');
const invalidUpdateData = { quantity_in_stock: 50 }; // Missing reorder_threshold and stock_fulfillment_time
const invalidUpdateResult = await makeRequest('/api/stocks/1', 'PUT', invalidUpdateData, staffToken);
console.log(`   Status: ${invalidUpdateResult.status}`);
console.log(`   Response:`, invalidUpdateResult.data);
console.log('');

// Test 13: Error cases - Try to update stock with negative values
console.log('13. Testing PUT /api/stocks/1 with negative values...');
const negativeUpdateData = {
	quantity_in_stock: -10,
	reorder_threshold: -5,
	stock_fulfillment_time: -1
};
const negativeUpdateResult = await makeRequest('/api/stocks/1', 'PUT', negativeUpdateData, staffToken);
console.log(`   Status: ${negativeUpdateResult.status}`);
console.log(`   Response:`, negativeUpdateResult.data);
console.log('');

// Test 14: Clean up - Delete the test meal
console.log(`14. Testing DELETE /api/meals/${mealId} (clean up test meal)...`);
const deleteMealResult = await makeRequest(`/api/meals/${mealId}`, 'DELETE', null, staffToken);
console.log(`   Status: ${deleteMealResult.status}`);
console.log(`   Response:`, deleteMealResult.data);
console.log('');

console.log('\nAll stock endpoint tests completed!');
