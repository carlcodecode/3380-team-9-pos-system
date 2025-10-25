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

console.log('Testing Backend Review Endpoints\n');

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

const staffToken = staffLogin.data.token;

// Test 2: Login as customer
console.log('2. Testing customer login...');
const customerLogin = await makeRequest('/api/auth/login', 'POST', { username: 'customer1', password: 'customer1' });
console.log(`   Status: ${customerLogin.status}`);
console.log(`   Response:`, customerLogin.data);
console.log('');

if (!customerLogin.data.token) {
	console.error('Failed to login as customer. Cannot proceed with tests.');
	process.exit(1);
}

const customerToken = customerLogin.data.token;

// Test 3: Get all meals to find one to review
console.log('3. Testing GET /api/meals (get all meals)...');
const getMealsResult = await makeRequest('/api/meals', 'GET', null, staffToken);
console.log(`   Status: ${getMealsResult.status}`);
console.log(`   Response:`, getMealsResult.data);
console.log('');

let mealId = null;
if (getMealsResult.status === 200 && Array.isArray(getMealsResult.data) && getMealsResult.data.length > 0) {
	mealId = getMealsResult.data[0].meal_id;
	console.log(`   Using meal ID: ${mealId}`);
} else {
	console.error('No meals found. Cannot proceed with review tests.');
	process.exit(1);
}

// Test 4: Create a valid review
console.log('4. Testing POST /api/reviews (create review)...');
const createReviewData = {
	meal_ref: mealId,
	stars: 5,
	user_comment: 'Excellent meal!'
};
const createReviewResult = await makeRequest('/api/reviews', 'POST', createReviewData, customerToken);
console.log(`   Status: ${createReviewResult.status}`);
console.log(`   Response:`, createReviewResult.data);
console.log('');

// Test 5: Try to create duplicate review (should fail)
console.log('5. Testing POST /api/reviews (duplicate review)...');
const duplicateReviewResult = await makeRequest('/api/reviews', 'POST', createReviewData, customerToken);
console.log(`   Status: ${duplicateReviewResult.status}`);
console.log(`   Response:`, duplicateReviewResult.data);
console.log('');

// Test 6: Try to create review with invalid stars (negative)
console.log('6. Testing POST /api/reviews (invalid stars - negative)...');
const invalidStarsNegative = {
	meal_ref: mealId,
	stars: -1
};
const invalidStarsResult = await makeRequest('/api/reviews', 'POST', invalidStarsNegative, customerToken);
console.log(`   Status: ${invalidStarsResult.status}`);
console.log(`   Response:`, invalidStarsResult.data);
console.log('');

// Test 7: Try to create review with invalid stars (too high)
console.log('7. Testing POST /api/reviews (invalid stars - too high)...');
const invalidStarsHigh = {
	meal_ref: mealId,
	stars: 6
};
const invalidStarsHighResult = await makeRequest('/api/reviews', 'POST', invalidStarsHigh, customerToken);
console.log(`   Status: ${invalidStarsHighResult.status}`);
console.log(`   Response:`, invalidStarsHighResult.data);
console.log('');

// Test 8: Try to create review with non-integer stars
console.log('8. Testing POST /api/reviews (invalid stars - non-integer)...');
const invalidStarsFloat = {
	meal_ref: mealId,
	stars: 3.5
};
const invalidStarsFloatResult = await makeRequest('/api/reviews', 'POST', invalidStarsFloat, customerToken);
console.log(`   Status: ${invalidStarsFloatResult.status}`);
console.log(`   Response:`, invalidStarsFloatResult.data);
console.log('');

// Test 9: Try to create review without required fields
console.log('9. Testing POST /api/reviews (missing required fields)...');
const missingFields = { stars: 4 };
const missingFieldsResult = await makeRequest('/api/reviews', 'POST', missingFields, customerToken);
console.log(`   Status: ${missingFieldsResult.status}`);
console.log(`   Response:`, missingFieldsResult.data);
console.log('');

// Test 10: Try to create review for non-existent meal
console.log('10. Testing POST /api/reviews (non-existent meal)...');
const nonExistentMeal = {
	meal_ref: 99999,
	stars: 4
};
const nonExistentMealResult = await makeRequest('/api/reviews', 'POST', nonExistentMeal, customerToken);
console.log(`   Status: ${nonExistentMealResult.status}`);
console.log(`   Response:`, nonExistentMealResult.data);
console.log('');

// Test 11: Try to create review as staff (should fail)
console.log('11. Testing POST /api/reviews as staff (should fail)...');
const staffReview = {
	meal_ref: mealId,
	stars: 3
};
const staffReviewResult = await makeRequest('/api/reviews', 'POST', staffReview, staffToken);
console.log(`   Status: ${staffReviewResult.status}`);
console.log(`   Response:`, staffReviewResult.data);
console.log('');

// Test 12: Try to create review without authentication
console.log('12. Testing POST /api/reviews without authentication...');
const noAuthResult = await makeRequest('/api/reviews', 'POST', createReviewData);
console.log(`   Status: ${noAuthResult.status}`);
console.log(`   Response:`, noAuthResult.data);
console.log('');

// Test 13: Create review with zero stars (valid edge case)
console.log('13. Testing POST /api/reviews (zero stars)...');
const zeroStarsReview = {
	meal_ref: mealId,
	stars: 0,
	user_comment: 'Terrible meal'
};
const zeroStarsResult = await makeRequest('/api/reviews', 'POST', zeroStarsReview, customerToken);
console.log(`   Status: ${zeroStarsResult.status}`);
console.log(`   Response:`, zeroStarsResult.data);
console.log('');

// Test 14: Create review without comment (should be valid)
console.log('14. Testing POST /api/reviews (no comment)...');
const noCommentReview = {
	meal_ref: mealId,
	stars: 2
};
const noCommentResult = await makeRequest('/api/reviews', 'POST', noCommentReview, customerToken);
console.log(`   Status: ${noCommentResult.status}`);
console.log(`   Response:`, noCommentResult.data);

console.log('\nAll review endpoint tests completed!');
