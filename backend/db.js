const { Pool } = require('pg');
require('dotenv').config();

// Connect to PostgreSQL database (local or cloud)
const isCloudDB = process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/postgres',
  ssl: isCloudDB ? { rejectUnauthorized: false } : false
});

// Function to connect and create the table if it does not exist
const initDB = async () => {
  try {
    console.log('Connecting to PostgreSQL...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS queries (
        id SERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        response TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('PostgreSQL connected and "queries" table is ready!');
  } catch (err) {
    console.error('Database connection error:', err.message);
  }
};

module.exports = { pool, initDB };
