const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root293',
  database: process.env.DB_NAME || 'feedback_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00'
});

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    console.error('   Make sure MySQL is running and credentials in .env are correct');
  }
}

module.exports = { pool, testConnection };
