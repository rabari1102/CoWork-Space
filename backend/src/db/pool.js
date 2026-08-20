import pg from 'pg';
import { config } from '../config/env.js';

// TIMESTAMP columns are venue local wall-clock time. node-postgres would
// otherwise hand them back as Date objects shifted by the process timezone, so
// parse them as plain strings and let the API return them as-is.
pg.types.setTypeParser(pg.types.builtins.TIMESTAMP, (value) => value);

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  max: 20,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
});

// Pool error handling for idle clients
pool.on('error', (err) => {
  console.error('❌ [Database] Unexpected idle client error:', err.message);
});

// Helper to extract a sanitized database connection string for logs
function getDatabaseHostInfo() {
  try {
    const parsed = new URL(config.databaseUrl);
    return `${parsed.username}@${parsed.hostname}:${parsed.port || '5432'}${parsed.pathname}`;
  } catch {
    return 'configured database';
  }
}

// Initial connection test with clear status logging
pool
  .query('SELECT current_database(), version()')
  .then(({ rows }) => {
    const dbName = rows[0]?.current_database || 'postgres';
    console.log(`✅ [Database] PostgreSQL connected successfully to database "${dbName}"`);
  })
  .catch((err) => {
    console.error(`❌ [Database] Connection failed for (${getDatabaseHostInfo()}):`, err.message);
  });

export function query(text, params) {
  return pool.query(text, params);
}

/**
 * Runs the callback inside a transaction on a dedicated connection and commits
 * it, or rolls back if the callback throws.
 */
export async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
