import path from 'path';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import { config } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { docsRouter, openApiJsonHandler } from './docs/docs.handler.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { bookingsRouter } from './modules/bookings/bookings.routes.js';
import { spacesRouter } from './modules/spaces/spaces.routes.js';
import { uploadRouter } from './modules/upload/upload.routes.js';

const app = express();

// Serve static uploads
const uploadDir = path.resolve(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadDir));

// Behind a proxy (nginx in Docker, the platform edge when deployed), so trust
// one hop for the client IP the rate limiter keys on.
const allowedOrigins = new Set(config.corsOrigin);

app.set('trust proxy', 1);
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      // In non-production environments, allow any localhost or 127.0.0.1 origin
      if (
        config.env !== 'production' &&
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  }),
);

// Printed once per process so a rejected browser request can be diagnosed from
// the logs without guessing at what the environment variable actually held.
console.log(`CORS allowing: ${config.corsOrigin.join(', ')} (and local origins in ${config.env})`);
app.use(compression());
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/docs', docsRouter);
app.get('/api/openapi.json', openApiJsonHandler);

app.use('/api/auth', authRouter);
app.use('/api/spaces', spacesRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/upload', uploadRouter);

app.use(notFoundHandler);
app.use(errorHandler);

// An Express app is itself a (req, res) handler, so exporting it as the default
// is all a serverless host needs; server.js wraps the same instance in an HTTP
// listener for Docker and local development.
export default app;
