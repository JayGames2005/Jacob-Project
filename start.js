const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting application...\n');

// Run database setup
console.log('📦 Setting up database...');
try {
  execSync('node server/setup-db.js', { 
    stdio: 'inherit',
    cwd: path.join(__dirname)
  });
  console.log('✅ Database setup complete\n');
} catch (error) {
  console.error('⚠️  Database setup failed, but continuing...\n');
  console.error(error.message);
}

// Start the server
console.log('🌐 Starting server...');
require('./server/server.js');
