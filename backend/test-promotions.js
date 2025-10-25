// Test script for backend promotion endpoints
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

console.log('Testing Backend Promotion Endpoints\n');

// ✅ Helper to check valid promotion creation status
const validCreateStatus = (code) => [200, 201].includes(code);
// ✅ Helper for update
const validUpdateStatus = (code) => [200, 204].includes(code);
// ✅ Helper for delete
const validDeleteStatus = (code) => [200, 204].includes(code);

// 1) Login as staff
console.log('1. Testing staff login...');
const staffLogin = await makeRequest('/api/auth/login', 'POST', {
  username: 'staff',
  password: 'staff',
});
console.log(`   Status: ${staffLogin.status}`);
console.log('   Response:', staffLogin.data, '\n');

if (!staffLogin.data?.token) {
  console.error('Failed to login as staff. Cannot proceed with tests.');
  process.exit(1);
}
const staffToken = staffLogin.data.token;

// 2) GET all
console.log('2. Testing GET /api/promotions ...');
const getAll0 = await makeRequest('/api/promotions', 'GET', null, staffToken);
console.log(`   Status: ${getAll0.status}`);
console.log('   Response:', getAll0.data, '\n');

// 3) CREATE promo
console.log('3. Testing POST /api/promotions ...');
const createBody1 = {
  promo_description: 'Test early-bird coupon',
  promo_type: 1,
  promo_code: 'EARLY20',
  promo_exp_date: '2025-12-31',
};
const createRes1 = await makeRequest('/api/promotions', 'POST', createBody1, staffToken);
console.log(`   Status: ${createRes1.status}`);
console.log('   Response:', createRes1.data, '\n');

if (!validCreateStatus(createRes1.status) || !createRes1.data?.promotion?.promotion_id) {
  console.error('Failed to create promotion. Cannot proceed with remaining tests.');
  process.exit(1);
}
const promoId1 = createRes1.data.promotion.promotion_id;

// 4) GET all again
console.log('4. Testing GET /api/promotions after create ...');
const getAll1 = await makeRequest('/api/promotions', 'GET', null, staffToken);
console.log(`   Status: ${getAll1.status}`);
console.log('   Response:', getAll1.data, '\n');

// 5) GET by ID
console.log(`5. Testing GET /api/promotions/${promoId1} ...`);
const getById1 = await makeRequest(`/api/promotions/${promoId1}`, 'GET', null, staffToken);
console.log(`   Status: ${getById1.status}`);
console.log('   Response:', getById1.data, '\n');

// 6) UPDATE promo
console.log(`6. Testing PUT /api/promotions/${promoId1} ...`);
const updateRes1 = await makeRequest(
  `/api/promotions/${promoId1}`,
  'PUT',
  {
    promo_description: 'Updated early-bird coupon',
    promo_type: 2,
    promo_code: 'EARLY30',
    promo_exp_date: '2026-01-31',
  },
  staffToken,
);
console.log(`   Status: ${updateRes1.status}`);
console.log('   Response:', updateRes1.data, '\n');

if (!validUpdateStatus(updateRes1.status)) {
  console.error('Update failed.');
  process.exit(1);
}

// 7) CREATE another
console.log('7. Testing POST /api/promotions ...');
const createBody2 = {
  promo_description: 'Spring special',
  promo_type: 0,
  promo_code: 'SPRING15',
  promo_exp_date: '2025-04-15',
};
const createRes2 = await makeRequest('/api/promotions', 'POST', createBody2, staffToken);
console.log(`   Status: ${createRes2.status}`);
console.log('   Response:', createRes2.data, '\n');

const promoId2 = createRes2.data?.promotion?.promotion_id;

// 8) GET all again
console.log('8. Testing GET /api/promotions ...');
const getAll2 = await makeRequest('/api/promotions', 'GET', null, staffToken);
console.log(`   Status: ${getAll2.status}`);
console.log('   Response:', getAll2.data, '\n');

// 9) No token
console.log('9. Testing GET /api/promotions NO AUTH ...');
const noAuth = await makeRequest('/api/promotions', 'GET');
console.log(`   Status: ${noAuth.status}`);
console.log('   Response:', noAuth.data, '\n');

// 10) Customer role should be forbidden
console.log('10. Testing GET /api/promotions as CUSTOMER ...');
const customerLogin = await makeRequest('/api/auth/login', 'POST', {
  username: 'customer1',
  password: 'customer1',
});
if (customerLogin.data?.token) {
  const custRes = await makeRequest('/api/promotions', 'GET', null, customerLogin.data.token);
  console.log(`   Status: ${custRes.status}`);
  console.log('   Response:', custRes.data, '\n');
}

// 11) Non-existent ID
console.log('11. Testing GET /api/promotions/999999 ...');
const notFound = await makeRequest('/api/promotions/999999', 'GET', null, staffToken);
console.log(`   Status: ${notFound.status}`);
console.log('   Response:', notFound.data, '\n');

// 12) Invalid create
console.log('12. Testing invalid POST ...');
const invalidCreate = await makeRequest(
  '/api/promotions',
  'POST',
  { promo_description: 'oops' },
  staffToken,
);
console.log(`   Status: ${invalidCreate.status}`);
console.log('   Response:', invalidCreate.data, '\n');

// 13) Invalid update
console.log(`13. Testing invalid PUT ...`);
const invalidUpdate = await makeRequest(
  `/api/promotions/${promoId1}`,
  'PUT',
  { promo_type: -1 },
  staffToken,
);
console.log(`   Status: ${invalidUpdate.status}`);
console.log('   Response:', invalidUpdate.data, '\n');

// 14) DELETE first
console.log(`14. Testing DELETE /api/promotions/${promoId1} ...`);
const del1 = await makeRequest(`/api/promotions/${promoId1}`, 'DELETE', null, staffToken);
console.log(`   Status: ${del1.status}`);
console.log('   Response:', del1.data, '\n');

// 15) DELETE second
if (promoId2) {
  console.log(`15. Testing DELETE /api/promotions/${promoId2} ...`);
  const del2 = await makeRequest(`/api/promotions/${promoId2}`, 'DELETE', null, staffToken);
  console.log(`   Status: ${del2.status}`);
  console.log('   Response:', del2.data, '\n');
}

// 16) Verify empty
console.log('16. Testing GET /api/promotions after deletions ...');
const finalList = await makeRequest('/api/promotions', 'GET', null, staffToken);
console.log(`   Status: ${finalList.status}`);
console.log('   Response:', finalList.data, '\n');

console.log('\n✅ All promotion endpoint tests completed!');
