// Test script for promotion analytics endpoint
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
        if (!data) {
          return resolve({ status: res.statusCode, data: null });
        }
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

console.log('='.repeat(80));
console.log('PROMOTION ANALYTICS TEST');
console.log('='.repeat(80));
console.log('\n');

// 1) Login as staff
console.log('Step 1: Logging in as staff...');
const staffLogin = await makeRequest('/api/auth/login', 'POST', {
  username: 'staff',
  password: 'staff',
});
console.log(`✓ Status: ${staffLogin.status}`);

if (!staffLogin.data || !staffLogin.data.token) {
  console.error('❌ Failed to login as staff. Cannot proceed with tests.');
  console.error('Response:', staffLogin.data);
  process.exit(1);
}
const staffToken = staffLogin.data.token;
console.log('✓ Successfully logged in');
console.log('\n');

// 2) Test analytics endpoint with a standard date range
console.log('='.repeat(80));
console.log('Step 2: Fetching Promotion Analytics (Oct 2025)');
console.log('='.repeat(80));
const analytics = await makeRequest(
  '/api/promotions/analytics?start_date=2025-10-01&end_date=2025-10-27',
  'GET',
  null,
  staffToken,
);
console.log(`Status: ${analytics.status}\n`);

if (analytics.status !== 200) {
  console.log('❌ Non-200 status from /api/promotions/analytics');
  console.log('Response:', analytics.data);
  console.log('\n');
} else if (
  !analytics.data ||
  typeof analytics.data !== 'object' ||
  analytics.data.error ||
  !analytics.data.summary
) {
  console.log('❌ Unexpected response format from /api/promotions/analytics');
  console.log('Raw response:');
  console.log(
    typeof analytics.data === 'string' ? analytics.data : JSON.stringify(analytics.data, null, 2),
  );
  console.log('\n');
} else {
  const { summary, promotions, daily_trend, top_promotions, type_breakdown } = analytics.data;

  // Display Summary
  console.log('📊 SUMMARY STATISTICS');
  console.log('-'.repeat(80));
  console.log(`Total Promotions:       ${summary.total_promotions}`);
  console.log(`Active Promotions:      ${summary.active_promotions}`);
  console.log(`Total Uses:             ${summary.total_uses}`);
  console.log(`Total Revenue:          $${(summary.total_revenue / 100).toFixed(2)}`);
  console.log(`Unique Customers:       ${summary.unique_customers}`);
  console.log(`Avg Revenue Per Use:    $${(summary.avg_revenue_per_use / 100).toFixed(2)}`);
  console.log('\n');

  // Display Top Promotions
  if (Array.isArray(top_promotions) && top_promotions.length > 0) {
    console.log('🏆 TOP PERFORMING PROMOTIONS');
    console.log('-'.repeat(80));
    console.log('Rank | Code         | Description                    | Uses  | Revenue');
    console.log('-'.repeat(80));
    top_promotions.slice(0, 10).forEach((promo, idx) => {
      const code = String(promo.promo_code || '').padEnd(12);
      const desc = String(promo.promo_description || '')
        .substring(0, 30)
        .padEnd(30);
      const uses = String(promo.total_uses || 0).padStart(5);
      const revenue = `$${((promo.total_revenue || 0) / 100).toFixed(2)}`.padStart(10);
      console.log(`${String(idx + 1).padStart(4)} | ${code} | ${desc} | ${uses} | ${revenue}`);
    });
    console.log('\n');
  }

  // Display All Promotions
  if (Array.isArray(promotions) && promotions.length > 0) {
    console.log('📋 ALL PROMOTIONS DETAIL');
    console.log('-'.repeat(80));
    console.log('Code         | Type | Uses  | Customers | Revenue    | Avg Order');
    console.log('-'.repeat(80));
    promotions.forEach((promo) => {
      const code = String(promo.promo_code || '').padEnd(12);
      const type = String(promo.promo_type ?? '').padStart(4);
      const uses = String(promo.total_uses || 0).padStart(5);
      const customers = String(promo.unique_customers || 0).padStart(9);
      const revenue = `$${((promo.total_revenue || 0) / 100).toFixed(2)}`.padStart(10);
      const avgOrder = `$${((promo.avg_order_value || 0) / 100).toFixed(2)}`.padStart(9);
      console.log(`${code} | ${type} | ${uses} | ${customers} | ${revenue} | ${avgOrder}`);
    });
    console.log('\n');
  }

  // Display Daily Trend
  if (Array.isArray(daily_trend) && daily_trend.length > 0) {
    console.log('📈 DAILY USAGE TREND');
    console.log('-'.repeat(80));
    console.log('Date       | Uses  | Customers | Revenue');
    console.log('-'.repeat(80));
    daily_trend.slice(0, 15).forEach((day) => {
      const date = new Date(day.date).toLocaleDateString().padEnd(10);
      const uses = String(day.uses || 0).padStart(5);
      const customers = String(day.customers || 0).padStart(9);
      const revenue = `$${((day.revenue || 0) / 100).toFixed(2)}`.padStart(10);
      console.log(`${date} | ${uses} | ${customers} | ${revenue}`);
    });
    if (daily_trend.length > 15) {
      console.log(`... and ${daily_trend.length - 15} more days`);
    }
    console.log('\n');
  }

  // Display Type Breakdown
  if (Array.isArray(type_breakdown) && type_breakdown.length > 0) {
    console.log('📊 PROMOTION TYPE BREAKDOWN');
    console.log('-'.repeat(80));
    console.log('Type | Promo Count | Total Uses | Total Revenue');
    console.log('-'.repeat(80));
    type_breakdown.forEach((type) => {
      const typeNum = String(type.promo_type ?? '').padStart(4);
      const count = String(type.promo_count || 0).padStart(11);
      const uses = String(type.total_uses || 0).padStart(10);
      const revenue = `$${((type.total_revenue || 0) / 100).toFixed(2)}`.padStart(13);
      console.log(`${typeNum} | ${count} | ${uses} | ${revenue}`);
    });
    console.log('\n');
  }
}

// 3) Test with a wider date range
console.log('='.repeat(80));
console.log('Step 3: Fetching Promotion Analytics (Full Year 2025)');
console.log('='.repeat(80));
const analyticsYear = await makeRequest(
  '/api/promotions/analytics?start_date=2025-01-01&end_date=2025-12-31',
  'GET',
  null,
  staffToken,
);
console.log(`Status: ${analyticsYear.status}\n`);

if (
  analyticsYear.status === 200 &&
  analyticsYear.data &&
  typeof analyticsYear.data === 'object' &&
  !analyticsYear.data.error &&
  analyticsYear.data.summary
) {
  const { summary } = analyticsYear.data;
  console.log('📊 YEAR-TO-DATE SUMMARY');
  console.log('-'.repeat(80));
  console.log(`Total Promotions:       ${summary.total_promotions}`);
  console.log(`Active Promotions:      ${summary.active_promotions}`);
  console.log(`Total Uses:             ${summary.total_uses}`);
  console.log(`Total Revenue:          $${(summary.total_revenue / 100).toFixed(2)}`);
  console.log(`Unique Customers:       ${summary.unique_customers}`);
  console.log(`Avg Revenue Per Use:    $${(summary.avg_revenue_per_use / 100).toFixed(2)}`);
  console.log('\n');
} else {
  console.log('❌ Unexpected YTD analytics response:');
  console.log(
    typeof analyticsYear.data === 'string'
      ? analyticsYear.data
      : JSON.stringify(analyticsYear.data, null, 2),
  );
  console.log('\n');
}

// 4) Test error cases
console.log('='.repeat(80));
console.log('Step 4: Testing Error Cases');
console.log('='.repeat(80));

// Missing dates
console.log('\nTest 4a: Missing dates (should return 400)...');
const noDate = await makeRequest('/api/promotions/analytics', 'GET', null, staffToken);
console.log(`Status: ${noDate.status}`);
console.log(`Response: ${JSON.stringify(noDate.data)}`);

// Invalid date format
console.log('\nTest 4b: Invalid date format (should return 400)...');
const invalidDate = await makeRequest(
  '/api/promotions/analytics?start_date=invalid&end_date=2025-10-27',
  'GET',
  null,
  staffToken,
);
console.log(`Status: ${invalidDate.status}`);
console.log(`Response: ${JSON.stringify(invalidDate.data)}`);

// No authentication
console.log('\nTest 4c: No authentication (should return 401)...');
const noAuth = await makeRequest(
  '/api/promotions/analytics?start_date=2025-10-01&end_date=2025-10-27',
  'GET',
  null,
  null,
);
console.log(`Status: ${noAuth.status}`);
console.log(`Response: ${JSON.stringify(noAuth.data)}`);

console.log('\n');
console.log('='.repeat(80));
console.log('✅ ALL TESTS COMPLETED!');
console.log('='.repeat(80));
