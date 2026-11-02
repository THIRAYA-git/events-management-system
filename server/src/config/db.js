require("dotenv").config();

// DB_MODE=local  -> local PostgreSQL via node-postgres (pg), uses LOCAL_DATABASE_URL
// DB_MODE=neon   -> Neon serverless over HTTP (default), uses DATABASE_URL
const DB_MODE = (process.env.DB_MODE || "neon").toLowerCase();
const isLocal = DB_MODE === "local";

let rawQuery; // (text, params) => Promise<rows[]>
let sql; // tagged-template helper, same shape in both modes

if (isLocal) {
  const { Pool, types } = require("pg");
  // timestamp WITHOUT time zone: the database stores Sri Lanka local time
  types.setTypeParser(1114, (v) => new Date(v.replace(" ", "T") + "+05:30"));
  const pool = new Pool({ connectionString: process.env.LOCAL_DATABASE_URL });

  rawQuery = async (text, params = []) => (await pool.query(text, params)).rows;

  // Local replacement for Neon's sql`...` so existing code keeps working.
  sql = (strings, ...values) => {
    const text = strings.reduce((acc, part, i) => acc + `$${i}` + part);
    return rawQuery(text, values);
  };
  sql.query = rawQuery;
} else {
  const { neon } = require("@neondatabase/serverless");
  sql = neon(process.env.DATABASE_URL);
  rawQuery = (text, params = []) => sql.query(text, params);
}

// Only retry failures that happen while CONNECTING, i.e. the request never
// reached the database, so retrying can never run a write twice. Postgres
// errors (constraint violations, bad SQL) and mid-request resets are never retried.
const CONNECT_ERROR_CODES = new Set([
  "UND_ERR_CONNECT_TIMEOUT",
  "ECONNREFUSED",
  "ENOTFOUND",
  "EAI_AGAIN",
]);

const errorCode = (err) =>
  err?.sourceError?.cause?.code || err?.cause?.code || err?.code;

const isConnectError = (err) => CONNECT_ERROR_CODES.has(errorCode(err));

const RETRY_DELAYS_MS = [500, 1500]; // up to 2 retries (3 attempts total)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const testConnection = async () => {
  const rows = await rawQuery("SELECT NOW() as time");
  console.log(
    isLocal
      ? "✅ PostgreSQL connected (LOCAL)"
      : "✅ PostgreSQL connected via Neon serverless"
  );
  console.log("🕐 Server time:", rows[0].time);
};

const query = async (text, params = []) => {
  for (let attempt = 0; ; attempt++) {
    try {
      const rows = await rawQuery(text, params);
      return { rows };
    } catch (err) {
      if (!isConnectError(err) || attempt >= RETRY_DELAYS_MS.length) throw err;
      console.warn(
        `[db:${DB_MODE}] connect failed (${errorCode(err)}), retry ${
          attempt + 1
        }/${RETRY_DELAYS_MS.length}`
      );
      await sleep(RETRY_DELAYS_MS[attempt]);
    }
  }
};

module.exports = { query, sql, testConnection };
