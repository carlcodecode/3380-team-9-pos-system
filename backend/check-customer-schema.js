import pool from './config/database.js';

async function checkSchema() {
  try {
    console.log('Checking CUSTOMER table schema...\n');
    
    // Get CUSTOMER table structure
    const [customerColumns] = await pool.query('DESCRIBE CUSTOMER');
    
    console.log('CUSTOMER table columns:');
    console.log('=======================');
    customerColumns.forEach(col => {
      console.log(`${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default}`);
    });
    
    console.log('\n\nSample customer data (first row):');
    console.log('==================================');
    const [customerSample] = await pool.query('SELECT * FROM CUSTOMER LIMIT 1');
    if (customerSample.length > 0) {
      console.log(JSON.stringify(customerSample[0], null, 2));
    } else {
      console.log('No customer data found');
    }
    
    // Check for PAYMENT_METHOD table
    console.log('\n\nChecking PAYMENT_METHOD table schema...\n');
    const [paymentColumns] = await pool.query('DESCRIBE PAYMENT_METHOD');
    
    console.log('PAYMENT_METHOD table columns:');
    console.log('==============================');
    paymentColumns.forEach(col => {
      console.log(`${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default}`);
    });
    
    console.log('\n\nSample payment method data (first row):');
    console.log('========================================');
    const [paymentSample] = await pool.query('SELECT * FROM PAYMENT_METHOD LIMIT 1');
    if (paymentSample.length > 0) {
      console.log(JSON.stringify(paymentSample[0], null, 2));
    } else {
      console.log('No payment method data found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkSchema();
