const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection configuration
// Can connect using a DATABASE_URL or individual variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/kaal_ai_db',
  // SSL configuration (useful when deploying to cloud providers like Render/Neon/Supabase)
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sslmode=require') 
    ? { rejectUnauthorized: false } 
    : false
});

// Test connection and create table if it does not exist
const initDB = async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL successfully!');

    // Create the queries table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS queries (
        id SERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        response TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await client.query(createTableQuery);
    console.log('Table "queries" is ready.');
    client.release();
  } catch (err) {
    console.error('Error connecting to PostgreSQL:', err.message);
    console.log('Note: Ensure PostgreSQL is running and the database exists.');
  }
};

module.exports = { pool, initDB };
