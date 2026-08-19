import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { config } from './config/env.js';
import { runMigrations } from './db/migrate.js';
import { pool } from './db/pool.js';

const app = createApp();

// Vercel imports this module and drives the exported app itself, so the
// bootstrap below is guarded: it only runs when the file is executed directly,
// which is what Docker and `npm run dev` do.
export default app;

/** Waits for Postgres to accept connections; the DB container may still be booting. */
async function waitForDatabase(attempts = 15) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch (error) {
      if (attempt === attempts) throw error;
      console.log(`database not ready (attempt ${attempt}/${attempts}), retrying...`);
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

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  start().catch((error) => {
    console.error('failed to start server:', error.message);
    process.exit(1);
  });
}
