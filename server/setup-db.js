require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...');

    // Check if .env exists
    const envPath = path.join(__dirname, '..', '.env');
    if (!fs.existsSync(envPath)) {
      console.error('\n❌ .env file not found!');
      console.log('\n📝 Please create a .env file:');
      console.log('   1. Copy .env.example to .env');
      console.log('   2. Edit .env and set your database password');
      console.log('\nOn Windows PowerShell:');
      console.log('   Copy-Item .env.example .env');
      console.log('   notepad .env');
      process.exit(1);
    }

    // Import database after .env check
    const { pool } = require('./database');

    // Test connection
    console.log('🔌 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected');

    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📝 Creating tables...');
    await pool.query(schema);

    console.log('\n✅ Database setup complete!');
    console.log('📋 Tables created:');
    console.log('   - users');
    console.log('   - servers');
    console.log('   - server_members');
    console.log('   - roles');
    console.log('   - member_roles');
    console.log('   - channels');
    console.log('   - messages');
    console.log('   - reactions');
    console.log('   - direct_messages');
    console.log('   - friend_requests');
    console.log('   - invites');
    console.log('   - voice_sessions');
    console.log('   - audit_logs');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database setup failed!');
    console.error('\nError details:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Possible solutions:');
      console.log('   1. Make sure PostgreSQL is installed and running');
      console.log('   2. Check if the service is started:');
      console.log('      Get-Service -Name postgresql*');
      console.log('   3. Verify your .env file has correct database credentials');
    } else if (error.code === '3D000') {
      console.log('\n💡 Database does not exist. Create it with:');
      console.log('   psql -U postgres -c "CREATE DATABASE discord_clone;"');
    } else if (error.code === '28P01') {
      console.log('\n💡 Authentication failed. Check your database password in .env');
    } else {
      console.log('\n💡 Check the error above and verify:');
      console.log('   1. PostgreSQL is running');
      console.log('   2. Database "discord_clone" exists');
      console.log('   3. Credentials in .env are correct');
    }
    
    process.exit(1);
  }
}

setupDatabase();
