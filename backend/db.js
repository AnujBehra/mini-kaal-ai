const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection pool configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/postgres',
  max: 10,                       // Up to 10 concurrent connections in pool
  idleTimeoutMillis: 30000,       // Close idle connections after 30s
  connectionTimeoutMillis: 5000,  // Timeout connection attempt after 5s
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false
});

// Monitor pool errors on idle clients
pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL client error:', err.message);
});

// Initialize database: test connection and ensure table & index exist
const initDB = async () => {
  let client;
  try {
    client = await pool.connect();
    console.log('Connected to PostgreSQL successfully!');

    // 1. Create queries table if not exists
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS queries (
        id SERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        response TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await client.query(createTableQuery);

    // 2. Index on created_at for fast history queries
    const createIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_queries_created_at ON queries (created_at DESC);
    `;
    await client.query(createIndexQuery);

    console.log('Database table and index are ready.');
  } catch (err) {
    console.error('PostgreSQL connection error:', err.message);
    console.log('Please verify PostgreSQL is running and DATABASE_URL is correct.');
  } finally {
    if (client) client.release();
  }
};

module.exports = { pool, initDB };
