// Test script for backend sale event endpoints
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

console.log('Testing Backend Sale Event Endpoints\n');

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

// Test 2: Get all sale events (should be empty initially)
console.log('2. Testing GET /api/sale-events (get all sale events)...');
const getAllResult = await makeRequest('/api/sale-events', 'GET', null, staffToken);
console.log(`   Status: ${getAllResult.status}`);
console.log(`   Response:`, getAllResult.data);
console.log('');

// Test 3: Create a new sale event
console.log('3. Testing POST /api/sale-events (create sale event)...');
const createData = {
	event_description: 'Test Holiday Sale',
	event_start: '2025-12-01',
	event_end: '2025-12-31',
	sitewide_event_type: 1,
	sitewide_discount_value: 20
};
const createResult = await makeRequest('/api/sale-events', 'POST', createData, staffToken);
console.log(`   Status: ${createResult.status}`);
console.log(`   Response:`, createResult.data);
console.log('');

if (createResult.status !== 200) {
	console.error('Failed to create sale event. Cannot proceed with remaining tests.');
	process.exit(1);
}

const saleEventId = createResult.data.sale_event_id;

// Test 4: Get all sale events (should now have 1 event)
console.log('4. Testing GET /api/sale-events (get all sale events after creation)...');
const getAllAfterCreateResult = await makeRequest('/api/sale-events', 'GET', null, staffToken);
console.log(`   Status: ${getAllAfterCreateResult.status}`);
console.log(`   Response:`, getAllAfterCreateResult.data);
console.log('');

// Test 5: Get specific sale event by ID
console.log(`5. Testing GET /api/sale-events/${saleEventId} (get sale event by ID)...`);
const getByIdResult = await makeRequest(`/api/sale-events/${saleEventId}`, 'GET', null, staffToken);
console.log(`   Status: ${getByIdResult.status}`);
console.log(`   Response:`, getByIdResult.data);
console.log('');

// Test 6: Update the sale event
console.log(`6. Testing PUT /api/sale-events/${saleEventId} (update sale event)...`);
const updateData = {
	event_description: 'Updated Test Holiday Sale',
	sitewide_discount_value: 25
};
const updateResult = await makeRequest(`/api/sale-events/${saleEventId}`, 'PUT', updateData, staffToken);
console.log(`   Status: ${updateResult.status}`);
console.log(`   Response:`, updateResult.data);
console.log('');

// Test 7: Create another sale event for testing
console.log('7. Testing POST /api/sale-events (create second sale event)...');
const createData2 = {
	event_description: 'Test Black Friday Sale',
	event_start: '2025-11-29',
	event_end: '2025-11-29',
	sitewide_event_type: 0,
	sitewide_discount_value: 50
};
const createResult2 = await makeRequest('/api/sale-events', 'POST', createData2, staffToken);
console.log(`   Status: ${createResult2.status}`);
console.log(`   Response:`, createResult2.data);
console.log('');

const saleEventId2 = createResult2.data?.sale_event?.sale_event_id;

// Test 8: Get all sale events (should now have 2 events)
console.log('8. Testing GET /api/sale-events (get all sale events with 2 events)...');
const getAllFinalResult = await makeRequest('/api/sale-events', 'GET', null, staffToken);
console.log(`   Status: ${getAllFinalResult.status}`);
console.log(`   Response:`, getAllFinalResult.data);
console.log('');

// Test 9: Error cases - Try to access without authentication
console.log('9. Testing GET /api/sale-events without authentication...');
const noAuthResult = await makeRequest('/api/sale-events', 'GET');
console.log(`   Status: ${noAuthResult.status}`);
console.log(`   Response:`, noAuthResult.data);
console.log('');

// Test 10: Error cases - Try to access as customer (not staff)
console.log('10. Testing GET /api/sale-events as customer...');
const customerLogin = await makeRequest('/api/auth/login', 'POST', { username: 'customer1', password: 'customer1' });
if (customerLogin.data.token) {
	const customerToken = customerLogin.data.token;
	const customerAccessResult = await makeRequest('/api/sale-events', 'GET', null, customerToken);
	console.log(`   Status: ${customerAccessResult.status}`);
	console.log(`   Response:`, customerAccessResult.data);
} else {
	console.log('   Could not login as customer, skipping test');
}
console.log('');

// Test 11: Error cases - Try to get non-existent sale event
console.log('11. Testing GET /api/sale-events/99999 (non-existent ID)...');
const notFoundResult = await makeRequest('/api/sale-events/99999', 'GET', null, staffToken);
console.log(`   Status: ${notFoundResult.status}`);
console.log(`   Response:`, notFoundResult.data);
console.log('');

// Test 12: Error cases - Try to create sale event with invalid data
console.log('12. Testing POST /api/sale-events with invalid data (missing required fields)...');
const invalidCreateData = { event_description: 'Invalid Sale' }; // Missing required fields
const invalidCreateResult = await makeRequest('/api/sale-events', 'POST', invalidCreateData, staffToken);
console.log(`   Status: ${invalidCreateResult.status}`);
console.log(`   Response:`, invalidCreateResult.data);
console.log('');

// Test 13: Error cases - Try to update with invalid discount value (>=100)
console.log(`13. Testing PUT /api/sale-events/${saleEventId} with invalid discount (>=100)...`);
const invalidUpdateData = { sitewide_discount_value: 150 };
const invalidUpdateResult = await makeRequest(`/api/sale-events/${saleEventId}`, 'PUT', invalidUpdateData, staffToken);
console.log(`   Status: ${invalidUpdateResult.status}`);
console.log(`   Response:`, invalidUpdateResult.data);
console.log('');

// Test 14: Delete the first sale event
console.log(`14. Testing DELETE /api/sale-events/${saleEventId} (delete first sale event)...`);
const deleteResult = await makeRequest(`/api/sale-events/${saleEventId}`, 'DELETE', null, staffToken);
console.log(`   Status: ${deleteResult.status}`);
console.log(`   Response:`, deleteResult.data);
console.log('');

// Test 15: Delete the second sale event
if (saleEventId2) {
	console.log(`15. Testing DELETE /api/sale-events/${saleEventId2} (delete second sale event)...`);
	const deleteResult2 = await makeRequest(`/api/sale-events/${saleEventId2}`, 'DELETE', null, staffToken);
	console.log(`   Status: ${deleteResult2.status}`);
	console.log(`   Response:`, deleteResult2.data);
	console.log('');
}

// Test 16: Verify all sale events are deleted
console.log('16. Testing GET /api/sale-events (verify all sale events deleted)...');
const finalGetAllResult = await makeRequest('/api/sale-events', 'GET', null, staffToken);
console.log(`   Status: ${finalGetAllResult.status}`);
console.log(`   Response:`, finalGetAllResult.data);

console.log('\nAll sale event endpoint tests completed!');
