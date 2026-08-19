import pg from 'pg';
import { config } from '../config/env.js';

// TIMESTAMP columns are venue local wall-clock time. node-postgres would
// otherwise hand them back as Date objects shifted by the process timezone, so
// parse them as plain strings and let the API return them as-is.
pg.types.setTypeParser(pg.types.builtins.TIMESTAMP, (value) => value);

export const pool = new pg.Pool({ connectionString: config.databaseUrl });

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
