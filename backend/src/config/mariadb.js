const mysql = require('mysql2/promise');
require('dotenv').config();

// MariaDB connection pool for HR database (authentication)
const mariadbPool = mysql.createPool({
  host: process.env.MARIADB_HOST,
  port: process.env.MARIADB_PORT || 3306,
  database: process.env.MARIADB_DATABASE,
  user: process.env.MARIADB_USER,
  password: process.env.MARIADB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
mariadbPool.getConnection()
  .then(connection => {
    console.log('✅ MariaDB connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ MariaDB connection failed:', err.message);
  });

module.exports = mariadbPool;
