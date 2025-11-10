// Test script to generate CSV files from promotion analytics
import http from 'http';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3001';
const OUTPUT_DIR = './test-output';

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

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

// Generate comprehensive CSV from promotion analytics data
const generatePromotionDetailsCSV = (data, dateFrom, dateTo) => {
  const { promotions } = data;

  // Headers
  const headers = [
    'Promo Code',
    'Description',
    'Type',
    'Total Uses',
    'Unique Customers',
    'Total Revenue',
    'Avg Order Value',
    'First Used',
    'Last Used',
    'Expiry Date',
    'Status',
  ];

  // Rows
  const rows = promotions.map((promo) => {
    const isExpired = promo.promo_exp_date && new Date(promo.promo_exp_date) < new Date();
    const isUnused = promo.total_uses === 0;

    return [
      promo.promo_code,
      promo.promo_description,
      promo.promo_type,
      promo.total_uses,
      promo.unique_customers,
      `$${(promo.total_revenue / 100).toFixed(2)}`,
      `$${(promo.avg_order_value / 100).toFixed(2)}`,
      promo.first_use_date ? new Date(promo.first_use_date).toLocaleDateString() : 'N/A',
      promo.last_use_date ? new Date(promo.last_use_date).toLocaleDateString() : 'N/A',
      promo.promo_exp_date ? new Date(promo.promo_exp_date).toLocaleDateString() : 'N/A',
      isUnused ? 'Unused' : isExpired ? 'Expired' : 'Active',
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
};

// Generate Summary CSV
const generateSummaryCSV = (data, dateFrom, dateTo) => {
  const { summary } = data;

  const csvContent = [
    'Metric,Value',
    `Report Period,"${dateFrom} to ${dateTo}"`,
    `Total Promotions,${summary.total_promotions}`,
    `Active Promotions,${summary.active_promotions}`,
    `Total Uses,${summary.total_uses}`,
    `Total Revenue,"$${(summary.total_revenue / 100).toFixed(2)}"`,
    `Unique Customers,${summary.unique_customers}`,
    `Average Revenue Per Use,"$${(summary.avg_revenue_per_use / 100).toFixed(2)}"`,
  ].join('\n');

  return csvContent;
};

// Generate Top Promotions CSV
const generateTopPromotionsCSV = (data) => {
  const { top_promotions } = data;

  const headers = [
    'Rank',
    'Promo Code',
    'Description',
    'Total Uses',
    'Unique Customers',
    'Total Revenue',
    '% of Total Revenue',
  ];

  const totalRevenue = data.summary.total_revenue;

  const rows = top_promotions.map((promo, idx) => {
    const percentOfTotal = totalRevenue > 0 ? (promo.total_revenue / totalRevenue) * 100 : 0;
    return [
      idx + 1,
      promo.promo_code,
      promo.promo_description,
      promo.total_uses,
      promo.unique_customers,
      `$${(promo.total_revenue / 100).toFixed(2)}`,
      `${percentOfTotal.toFixed(1)}%`,
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
};

// Generate Daily Trend CSV
const generateDailyTrendCSV = (data) => {
  const { daily_trend } = data;

  const headers = ['Date', 'Uses', 'Unique Customers', 'Revenue'];

  const rows = daily_trend.map((day) => [
    new Date(day.date).toLocaleDateString(),
    day.uses,
    day.customers,
    `$${(day.revenue / 100).toFixed(2)}`,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
};

// Generate Type Breakdown CSV
const generateTypeBreakdownCSV = (data) => {
  const { type_breakdown } = data;

  const headers = [
    'Promotion Type',
    'Number of Promos',
    'Total Uses',
    'Unique Customers',
    'Total Revenue',
    'Avg Revenue Per Promo',
  ];

  const rows = type_breakdown.map((type) => {
    const avgPerPromo = type.promo_count > 0 ? type.total_revenue / type.promo_count : 0;
    return [
      `Type ${type.promo_type}`,
      type.promo_count,
      type.total_uses,
      type.unique_customers,
      `$${(type.total_revenue / 100).toFixed(2)}`,
      `$${(avgPerPromo / 100).toFixed(2)}`,
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
};

console.log('='.repeat(80));
console.log('PROMOTION ANALYTICS CSV EXPORT TEST');
console.log('Joins PROMOTION, ORDER_PROMOTION, ORDER, CUSTOMER tables');
console.log('='.repeat(80));
console.log('\n');

// Login as staff
console.log('Step 1: Logging in as staff...');
const staffLogin = await makeRequest('/api/auth/login', 'POST', {
  username: 'staff',
  password: 'staff',
});

if (!staffLogin.data?.token) {
  console.error('❌ Failed to login as staff. Cannot proceed with tests.');
  process.exit(1);
}
const staffToken = staffLogin.data.token;
console.log('✓ Successfully logged in\n');

// Fetch analytics data
console.log('Step 2: Fetching promotion analytics data...');
const dateFrom = '2025-10-01';
const dateTo = '2025-10-27';

const analytics = await makeRequest(
  `/api/promotions/analytics?start_date=${dateFrom}&end_date=${dateTo}`,
  'GET',
  null,
  staffToken,
);

if (analytics.status !== 200) {
  console.error('❌ Failed to fetch analytics data:', analytics.data);
  process.exit(1);
}

console.log('✓ Successfully fetched analytics data');
console.log(`  - Joined 4 tables for comprehensive insights\n`);

// Generate CSV files
console.log('Step 3: Generating CSV files...\n');

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);

// 1. Promotion Details CSV
const detailsCSV = generatePromotionDetailsCSV(analytics.data, dateFrom, dateTo);
const detailsFilename = `${OUTPUT_DIR}/promo_analytics_details_${timestamp}.csv`;
fs.writeFileSync(detailsFilename, detailsCSV);
console.log(`✓ Generated: ${detailsFilename}`);

// 2. Summary CSV
const summaryCSV = generateSummaryCSV(analytics.data, dateFrom, dateTo);
const summaryFilename = `${OUTPUT_DIR}/promo_analytics_summary_${timestamp}.csv`;
fs.writeFileSync(summaryFilename, summaryCSV);
console.log(`✓ Generated: ${summaryFilename}`);

// 3. Top Promotions CSV
if (analytics.data.top_promotions.length > 0) {
  const topCSV = generateTopPromotionsCSV(analytics.data);
  const topFilename = `${OUTPUT_DIR}/promo_analytics_top_performers_${timestamp}.csv`;
  fs.writeFileSync(topFilename, topCSV);
  console.log(`✓ Generated: ${topFilename}`);
}

// 4. Daily Trend CSV
if (analytics.data.daily_trend.length > 0) {
  const trendCSV = generateDailyTrendCSV(analytics.data);
  const trendFilename = `${OUTPUT_DIR}/promo_analytics_daily_trend_${timestamp}.csv`;
  fs.writeFileSync(trendFilename, trendCSV);
  console.log(`✓ Generated: ${trendFilename}`);
}

// 5. Type Breakdown CSV
if (analytics.data.type_breakdown.length > 0) {
  const typeCSV = generateTypeBreakdownCSV(analytics.data);
  const typeFilename = `${OUTPUT_DIR}/promo_analytics_type_breakdown_${timestamp}.csv`;
  fs.writeFileSync(typeFilename, typeCSV);
  console.log(`✓ Generated: ${typeFilename}`);
}

// 6. Customer Demographics CSV
if (analytics.data.customer_demographics) {
  const demoCSV = [
    'Metric,Value',
    `Total Customers Using Promos,${analytics.data.customer_demographics.total_promo_users}`,
    `Total Orders with Promos,${analytics.data.customer_demographics.total_orders_with_promos}`,
    `Avg Orders Per Customer,"${analytics.data.customer_demographics.avg_orders_per_customer.toFixed(
      2,
    )}"`,
    `Total Customer Spending,"$${(
      analytics.data.customer_demographics.total_customer_spending / 100
    ).toFixed(2)}"`,
  ].join('\n');
  const demoFilename = `${OUTPUT_DIR}/promo_analytics_customer_demographics_${timestamp}.csv`;
  fs.writeFileSync(demoFilename, demoCSV);
  console.log(`✓ Generated: ${demoFilename}`);
}

console.log('\n');
console.log('='.repeat(80));
console.log('Step 4: Displaying CSV Previews');
console.log('='.repeat(80));
console.log('\n');

// Show preview of the main details CSV
console.log('📄 PROMOTION DETAILS CSV PREVIEW');
console.log('-'.repeat(80));
const previewLines = detailsCSV.split('\n').slice(0, 6); // Header + 5 rows
console.log(previewLines.join('\n'));
if (analytics.data.promotions.length > 5) {
  console.log(`... and ${analytics.data.promotions.length - 5} more rows`);
}
console.log('\n');

// Show preview of customer demographics
if (analytics.data.customer_demographics) {
  console.log('CUSTOMER DEMOGRAPHICS CSV PREVIEW');
  console.log('-'.repeat(80));
  console.log('Metric,Value');
  console.log(
    `Total Customers Using Promos,${analytics.data.customer_demographics.total_promo_users}`,
  );
  console.log(
    `Total Orders with Promos,${analytics.data.customer_demographics.total_orders_with_promos}`,
  );
  console.log(
    `Avg Orders Per Customer,"${analytics.data.customer_demographics.avg_orders_per_customer.toFixed(
      2,
    )}"`,
  );
  console.log(
    `Total Customer Spending,"$${(
      analytics.data.customer_demographics.total_customer_spending / 100
    ).toFixed(2)}"`,
  );
  console.log('\n');
}

// Show preview of top promotions CSV
if (analytics.data.top_promotions.length > 0) {
  console.log('TOP PROMOTIONS CSV PREVIEW');
  console.log('-'.repeat(80));
  const topLines = generateTopPromotionsCSV(analytics.data).split('\n').slice(0, 6); // Header + 5 rows
  console.log(topLines.join('\n'));
  console.log('\n');
}

console.log('='.repeat(80));
console.log('CSV EXPORT TEST COMPLETED!');
console.log('='.repeat(80));
console.log('\n');
console.log(`All CSV files have been saved to: ${OUTPUT_DIR}/`);
console.log('\nThe report includes meaningful joins across:');
console.log('  • PROMOTION table - Base promotion data');
console.log('  • ORDER_PROMOTION table - Promotion usage');
console.log('  • ORDER table - Order details and revenue');
console.log('  • CUSTOMER table - Customer demographics (who uses promos, ordering frequency)');
console.log('\nCustomer Demographics shows:');
console.log('  • How many unique customers used promotions');
console.log('  • Total orders placed with promotions');
console.log('  • Average orders per customer (frequency)');
console.log('  • Total spending by customers using promos');
console.log('\n');
