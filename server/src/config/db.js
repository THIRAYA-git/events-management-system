const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

const testConnection = async () => {
  const result = await sql`SELECT NOW() as time`;
  console.log('✅ PostgreSQL connected via Neon serverless');
  console.log('🕐 Server time:', result[0].time);
};

const query = async (text, params = []) => {
  const result = await sql.query(text, params);
  return { rows: result };
};

module.exports = { query, sql, testConnection };