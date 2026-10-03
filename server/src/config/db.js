const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

// Only retry failures that happen while CONNECTING, i.e. the request never
// reached Neon, so retrying can never run a write twice. Postgres errors
// (constraint violations, bad SQL) and mid-request resets are never retried.
const CONNECT_ERROR_CODES = new Set([
  'UND_ERR_CONNECT_TIMEOUT',
  'ECONNREFUSED',
  'ENOTFOUND',
  'EAI_AGAIN',
]);

const isConnectError = (err) => {
  const cause = err?.sourceError?.cause || err?.cause;
  return CONNECT_ERROR_CODES.has(cause?.code);
};

const RETRY_DELAYS_MS = [500, 1500]; // up to 2 retries (3 attempts total)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const testConnection = async () => {
  const result = await sql`SELECT NOW() as time`;
  console.log('✅ PostgreSQL connected via Neon serverless');
  console.log('🕐 Server time:', result[0].time);
};

const query = async (text, params = []) => {
  for (let attempt = 0; ; attempt++) {
    try {
      const result = await sql.query(text, params);
      return { rows: result };
    } catch (err) {
      if (!isConnectError(err) || attempt >= RETRY_DELAYS_MS.length) throw err;
      console.warn(
        `[db] connect failed (${err.sourceError?.cause?.code}), retry ${attempt + 1}/${RETRY_DELAYS_MS.length}`
      );
      await sleep(RETRY_DELAYS_MS[attempt]);
    }
  }
};

module.exports = { query, sql, testConnection };