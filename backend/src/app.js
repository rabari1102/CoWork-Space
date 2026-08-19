import cors from 'cors';
import express from 'express';
import { config } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { bookingsRouter } from './modules/bookings/bookings.routes.js';
import { spacesRouter } from './modules/spaces/spaces.routes.js';

const app = express();

// Behind a proxy (nginx in Docker, the platform edge when deployed), so trust
// one hop for the client IP the rate limiter keys on.
app.set('trust proxy', 1);
app.use(cors({ origin: config.corsOrigin }));

// Printed once per process so a rejected browser request can be diagnosed from
// the logs without guessing at what the environment variable actually held.
console.log(`CORS allowing: ${config.corsOrigin.join(', ')}`);
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRouter);
app.use('/api/spaces', spacesRouter);
app.use('/api/bookings', bookingsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

// An Express app is itself a (req, res) handler, so exporting it as the default
// is all a serverless host needs; server.js wraps the same instance in an HTTP
// listener for Docker and local development.
export default app;
