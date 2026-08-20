import { fileURLToPath } from 'node:url';
import app from './app.js';
import { config } from './config/env.js';
import { runMigrations } from './db/migrate.js';
import { pool } from './db/pool.js';

/** Waits for Postgres to accept connections; the DB container may still be booting. */
async function waitForDatabase(attempts = 15) {
  console.log('🔄 [Database] Verifying database connection...');
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await pool.query('SELECT 1');
      console.log('✅ [Database] Connection ready, proceeding with migrations and server start.');
      return;
    } catch (error) {
      if (attempt === attempts) {
        console.error(`❌ [Database] Failed to connect after ${attempts} attempts:`, error.message);
        throw error;
      }
      console.log(`⏳ [Database] Database not ready yet (attempt ${attempt}/${attempts}): ${error.message}. Retrying in 2s...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

async function start() {
  await waitForDatabase();
  await runMigrations();

  const server = app.listen(config.port, () => {
    console.log(`API listening on http://localhost:${config.port} (${config.env})`);
  });

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
      server.close(() => pool.end().then(() => process.exit(0)));
    });
  }
}

// Only bootstrap when this file is run directly, which is what Docker and
// `npm run dev` do. A serverless host imports app.js and drives it itself,
// where there is no boot step to hang migrations off.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  start().catch((error) => {
    console.error('failed to start server:', error.message);
    process.exit(1);
  });
}
