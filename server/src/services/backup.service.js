const { execFile } = require("child_process");
const { promisify } = require("util");
const fs = require("fs/promises");
const path = require("path");

const run = promisify(execFile);

const BACKUP_DIR = process.env.BACKUP_DIR
  ? path.resolve(process.env.BACKUP_DIR)
  : path.resolve(__dirname, "../../backups");
const KEEP = Number(process.env.BACKUP_KEEP || 7);
const PG_DUMP = process.env.PG_DUMP_PATH || "pg_dump";

// Same selection logic as config/db.js
function getConnection() {
  const isLocal = (process.env.DB_MODE || "neon").toLowerCase() === "local";
  const url = new URL(isLocal ? process.env.LOCAL_DATABASE_URL : process.env.DATABASE_URL);
  return {
    host: url.hostname,
    port: url.port || "5432",
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1),
    ssl: url.searchParams.get("sslmode") || (isLocal ? null : "require"),
  };
}

let running = false;

async function createBackup() {
  if (running) {
    const e = new Error("A backup is already running");
    e.statusCode = 409;
    throw e;
  }
  running = true;
  try {
    return await createBackupUnsafe();
  } finally {
    running = false;
  }
}

async function createBackupUnsafe() {
  await fs.mkdir(BACKUP_DIR, { recursive: true });
  const c = getConnection();
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const file = path.join(BACKUP_DIR, `ems-${stamp}.dump`);

  try {
    await run(
      PG_DUMP,
      ["-Fc", "-h", c.host, "-p", c.port, "-U", c.user, "-f", file, c.database],
      {
        env: {
          ...process.env,
          PGPASSWORD: c.password,
          ...(c.ssl ? { PGSSLMODE: c.ssl } : {}),
        },
      }
    );
  } catch (err) {
    await fs.unlink(file).catch(() => {}); // remove the empty/partial file
    // Show only pg_dump's own message, not the full command line
    throw new Error((err.stderr || err.message).toString().trim());
  }

  // Retention: keep the newest KEEP non-empty dumps
  const all = (await fs.readdir(BACKUP_DIR)).filter(f => f.endsWith(".dump"));
  const sized = await Promise.all(
    all.map(async f => ({ f, size: (await fs.stat(path.join(BACKUP_DIR, f))).size }))
  );
  const dumps = sized.filter(x => x.size > 0).map(x => x.f).sort();

  // remove any leftover 0-byte files from earlier failed runs
  for (const x of sized.filter(x => x.size === 0)) {
    await fs.unlink(path.join(BACKUP_DIR, x.f)).catch(() => {});
  }

  for (const old of dumps.slice(0, Math.max(0, dumps.length - KEEP))) {
    await fs.unlink(path.join(BACKUP_DIR, old));
  }

  const { size } = await fs.stat(file);
  return { file: path.basename(file), sizeBytes: size };
}

async function listBackups() {
  await fs.mkdir(BACKUP_DIR, { recursive: true });
  const dumps = (await fs.readdir(BACKUP_DIR)).filter(f => f.endsWith(".dump")).sort().reverse();
  return Promise.all(
    dumps.map(async f => {
      const s = await fs.stat(path.join(BACKUP_DIR, f));
      return { file: f, sizeBytes: s.size, createdAt: s.mtime };
    })
  );
}

// Only plain "ems-....dump" names are accepted: no slashes, no "..", nothing else
const SAFE_NAME = /^ems-[A-Za-z0-9._-]+\.dump$/;

async function deleteBackup(fileName) {
  if (
    typeof fileName !== "string" ||
    !SAFE_NAME.test(fileName) ||
    fileName.includes("..") ||
    path.basename(fileName) !== fileName
  ) {
    const e = new Error("Invalid backup file name");
    e.statusCode = 400;
    throw e;
  }

  const full = path.join(BACKUP_DIR, fileName);
  try {
    await fs.unlink(full);
  } catch (err) {
    if (err.code === "ENOENT") {
      const e = new Error("Backup file not found");
      e.statusCode = 404;
      throw e;
    }
    throw err;
  }
  return { file: fileName };
}

module.exports = { createBackup, listBackups, deleteBackup };
