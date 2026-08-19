import cors from 'cors';
import express from 'express';
import { config } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { bookingsRouter } from './modules/bookings/bookings.routes.js';
import { spacesRouter } from './modules/spaces/spaces.routes.js';

export function createApp() {
  const app = express();

  // Behind the compose nginx container, so trust one proxy hop for rate limiting.
  app.set('trust proxy', 1);
  app.use(cors({ origin: config.corsOrigin.split(',') }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  app.use('/api/auth', authRouter);
  app.use('/api/spaces', spacesRouter);
  app.use('/api/bookings', bookingsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
