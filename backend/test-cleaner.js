// Test data cleanup script for backend
// This script attempts to remove all test data created by the test scripts
// It continues running even if individual operations fail

import https from 'https';
import http from 'http';
import pool from './config/database.js';

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

// Helper function to attempt an operation and continue on failure
const attemptOperation = async (description, operation) => {
	try {
		console.log(`Attempting: ${description}`);
		await operation();
		console.log(`✓ Success: ${description}`);
	} catch (error) {
		console.log(`✗ Failed: ${description} - ${error.message}`);
	}
};

console.log('🧹 Starting test data cleanup...\n');

// Get authentication token
let staffToken = null;
try {
	console.log('Getting authentication token...');
	const staffLogin = await makeRequest('/api/auth/login', 'POST', { username: 'staff', password: 'staff' });
	if (staffLogin.data.token) {
		staffToken = staffLogin.data.token;
		console.log('✓ Authentication successful');
	} else {
		console.log('✗ Authentication failed - cannot clean up API data');
	}
} catch (error) {
	console.log(`✗ Authentication error: ${error.message}`);
}

// Clean up via API endpoints (if authenticated)
if (staffToken) {
	// Clean up meals created by tests
	await attemptOperation('Delete test meals containing "Test"', async () => {
		// Get all meals and filter test ones
		const getAllMeals = await makeRequest('/api/meals', 'GET', null, staffToken);
		if (getAllMeals.data && Array.isArray(getAllMeals.data)) {
			const testMeals = getAllMeals.data.filter(meal =>
				meal.meal_name && meal.meal_name.includes('Test')
			);

			for (const meal of testMeals) {
				await makeRequest(`/api/meals/${meal.meal_id}`, 'DELETE', null, staffToken);
			}
		}
	});

	// Clean up meal categories created by tests
	await attemptOperation('Delete test meal categories containing "Test" or starting with "Premium"', async () => {
		const getAllCategories = await makeRequest('/api/meal-categories', 'GET', null, staffToken);
		if (getAllCategories.data && Array.isArray(getAllCategories.data)) {
			const testCategories = getAllCategories.data.filter(category =>
				category.meal_type && (
					category.meal_type.includes('Test') ||
					category.meal_type.startsWith('Premium') ||
					category.meal_type === 'Vegan' // Created by test-meal-categories.js
				)
			);

			for (const category of testCategories) {
				await makeRequest(`/api/meal-categories/${category.meal_type_id}`, 'DELETE', null, staffToken);
			}
		}
	});

	// Note: Stock cleanup is handled automatically when meals are deleted due to foreign key constraints
}

// Clean up via direct database access (for any remaining data)
console.log('\n📊 Cleaning up via direct database access...\n');

// Direct database cleanup functions
const cleanupMeals = async () => {
	try {
		const [result] = await pool.query(
			'DELETE FROM MEAL WHERE meal_name LIKE ? OR meal_name LIKE ?',
			['%Test%', '%Updated Test%']
		);
		console.log(`✓ Deleted ${result.affectedRows} test meals from database`);
	} catch (error) {
		console.log(`✗ Database meal cleanup failed: ${error.message}`);
	}
};

const cleanupMealCategories = async () => {
	try {
		const [result] = await pool.query(
			'DELETE FROM MEAL_TYPE WHERE meal_type LIKE ? OR meal_type LIKE ? OR meal_type = ?',
			['%Test%', 'Premium%', 'Vegan']
		);
		console.log(`✓ Deleted ${result.affectedRows} test meal categories from database`);
	} catch (error) {
		console.log(`✗ Database meal category cleanup failed: ${error.message}`);
	}
};

const cleanupStocks = async () => {
	try {
		// This will be handled by foreign key constraints when meals are deleted
		// But let's also clean up any orphaned stock records
		const [result] = await pool.query(
			'DELETE FROM STOCK WHERE quantity_in_stock = ? OR reorder_threshold = ?',
			[50, 10] // Common test values
		);
		console.log(`✓ Deleted ${result.affectedRows} test stock records from database`);
	} catch (error) {
		console.log(`✗ Database stock cleanup failed: ${error.message}`);
	}
};

const cleanupUsers = async () => {
	try {
		// Only clean up test users, not real users
		const [result] = await pool.query(
			'DELETE FROM USER WHERE username LIKE ? AND role = ?',
			['test%', 'customer']
		);
		console.log(`✓ Deleted ${result.affectedRows} test users from database`);
	} catch (error) {
		console.log(`✗ Database user cleanup failed: ${error.message}`);
	}
};

const cleanupOrders = async () => {
	try {
		// Clean up test orders (this will cascade to order items)
		const [result] = await pool.query(
			'DELETE FROM ORDER_TABLE WHERE order_status = ?',
			['test']
		);
		console.log(`✓ Deleted ${result.affectedRows} test orders from database`);
	} catch (error) {
		console.log(`✗ Database order cleanup failed: ${error.message}`);
	}
};

// Execute database cleanup
await cleanupMeals();
await cleanupMealCategories();
await cleanupStocks();
await cleanupUsers();
await cleanupOrders();

// Verify cleanup
console.log('\n🔍 Verifying cleanup...\n');

const verifyCleanup = async () => {
	try {
		// Check meals
		const [meals] = await pool.query('SELECT COUNT(*) as count FROM MEAL WHERE meal_name LIKE ?', ['%Test%']);
		console.log(`Remaining test meals: ${meals[0].count}`);

		// Check meal categories
		const [categories] = await pool.query('SELECT COUNT(*) as count FROM MEAL_TYPE WHERE meal_type LIKE ? OR meal_type = ?', ['%Test%', 'Vegan']);
		console.log(`Remaining test meal categories: ${categories[0].count}`);

		// Check stocks
		const [stocks] = await pool.query('SELECT COUNT(*) as count FROM STOCK');
		console.log(`Total stock records: ${stocks[0].count}`);

	} catch (error) {
		console.log(`✗ Verification failed: ${error.message}`);
	}
};

await verifyCleanup();

// Close database connection
try {
	await pool.end();
	console.log('✓ Database connection closed');
} catch (error) {
	console.log(`✗ Error closing database: ${error.message}`);
}

console.log('\n🧹 Test data cleanup completed!');
console.log('Note: Some test data may remain if the test scripts were interrupted or if there were database errors.');
console.log('You can run this script multiple times if needed.');
