// Generate bcrypt hashes for admin/staff/customer passwords
import bcrypt from 'bcryptjs';

const passwords = {
  admin: 'admin',
  staff: 'staff',
  customer1: 'customer1'
};

console.log('🔐 Generating bcrypt hashes...\n');

for (const [user, password] of Object.entries(passwords)) {
  const hash = await bcrypt.hash(password, 10);
  console.log(`${user}:`);
  console.log(`  Password: ${password}`);
  console.log(`  Hash: ${hash}`);
  console.log('');
}

console.log('\n📋 SQL UPDATE Statements:\n');

for (const [user, password] of Object.entries(passwords)) {
  const hash = await bcrypt.hash(password, 10);
  console.log(`UPDATE USER_ACCOUNT SET user_password = '${hash}' WHERE username = '${user}';`);
}
