// Test script for backend admin endpoints
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

console.log('Testing Backend Admin Endpoints\n');

// Test 1: Login as admin
console.log('1. Testing admin login...');
const adminLogin = await makeRequest('/api/auth/login', 'POST', { username: 'admin', password: 'admin' });
console.log(`   Status: ${adminLogin.status}`);
console.log(`   Response:`, adminLogin.data);
console.log('');

if (!adminLogin.data.token) {
	console.error('Failed to login as admin. Cannot proceed with tests.');
	process.exit(1);
}

const adminToken = adminLogin.data.token;

// Test 2: Create a new staff user
console.log('2. Testing POST /api/admin/staff (create staff)...');
const createData = {
	email: 'teststaff@test.com',
	username: 'teststaff',
	password: 'staffpass123',
	firstName: 'Test',
	lastName: 'Staff',
	phone_number: '555-123-4567',
	hire_date: '2025-01-15',
	salary: 45000
};
const createResult = await makeRequest('/api/admin/staff', 'POST', createData, adminToken);
console.log(`   Status: ${createResult.status}`);
console.log(`   Response:`, createResult.data);

// Verify the created staff has the correct values
if (createResult.status === 201) {
	const staff = createResult.data.staff;
	console.log('   Verifying created staff data...');
	if (staff.phone_number !== createData.phone_number) {
		console.error(`   ERROR: Expected phone_number ${createData.phone_number}, got ${staff.phone_number}`);
	}
	if (staff.hire_date !== createData.hire_date) {
		console.error(`   ERROR: Expected hire_date ${createData.hire_date}, got ${staff.hire_date}`);
	}
	if (staff.salary !== createData.salary) {
		console.error(`   ERROR: Expected salary ${createData.salary}, got ${staff.salary}`);
	}
	console.log('   Verification complete.');
}
console.log('');

if (createResult.status !== 200) {
	console.error('Failed to create staff user. Cannot proceed with remaining tests.');
	process.exit(1);
}

const staffId = createResult.data.staff.id;

// Test 3: Get all staff users
console.log('3. Testing GET /api/admin/staff (get all staff)...');
const getAllResult = await makeRequest('/api/admin/staff', 'GET', null, adminToken);
console.log(`   Status: ${getAllResult.status}`);
console.log(`   Response:`, getAllResult.data);
console.log('');

// Test 4: Get specific staff user by ID
console.log(`4. Testing GET /api/admin/staff/${staffId} (get staff by ID)...`);
const getByIdResult = await makeRequest(`/api/admin/staff/${staffId}`, 'GET', null, adminToken);
console.log(`   Status: ${getByIdResult.status}`);
console.log(`   Response:`, getByIdResult.data);
console.log('');

// Test 5: Update the staff user
console.log(`5. Testing PUT /api/admin/staff/${staffId} (update staff)...`);
const updateData = {
	firstName: 'Updated',
	lastName: 'StaffUser',
	email: 'updatedstaff@test.com'
};
const updateResult = await makeRequest(`/api/admin/staff/${staffId}`, 'PUT', updateData, adminToken);
console.log(`   Status: ${updateResult.status}`);
console.log(`   Response:`, updateResult.data);
console.log('');

// Test 6: Delete the staff user
console.log(`6. Testing DELETE /api/admin/staff/${staffId} (delete staff)...`);
const deleteResult = await makeRequest(`/api/admin/staff/${staffId}`, 'DELETE', null, adminToken);
console.log(`   Status: ${deleteResult.status}`);
console.log(`   Response:`, deleteResult.data);
console.log('');

// Test 7: Error cases - Try to access without authentication
console.log('7. Testing GET /api/admin/staff without authentication...');
const noAuthResult = await makeRequest('/api/admin/staff', 'GET');
console.log(`   Status: ${noAuthResult.status}`);
console.log(`   Response:`, noAuthResult.data);
console.log('');

// Test 8: Error cases - Try to get non-existent staff
console.log('8. Testing GET /api/admin/staff/99999 (non-existent ID)...');
const notFoundResult = await makeRequest('/api/admin/staff/99999', 'GET', null, adminToken);
console.log(`   Status: ${notFoundResult.status}`);
console.log(`   Response:`, notFoundResult.data);
console.log('');

// Test 9: Error cases - Try to create staff with invalid data
console.log('9. Testing POST /api/admin/staff with invalid data (missing required fields)...');
const invalidCreateData = { firstName: 'Invalid' }; // Missing email, username, password
const invalidCreateResult = await makeRequest('/api/admin/staff', 'POST', invalidCreateData, adminToken);
console.log(`   Status: ${invalidCreateResult.status}`);
console.log(`   Response:`, invalidCreateResult.data);

console.log('\nAll admin endpoint tests completed!');
