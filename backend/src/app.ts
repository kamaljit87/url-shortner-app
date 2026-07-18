import cors from 'cors';
import express from 'express';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import redirectRoutes from './routes/redirectRoutes';
import urlRoutes from './routes/urlRoutes';

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.frontendUrl }));
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/urls', urlRoutes);

  // Public redirect route, mounted last so it doesn't shadow /api and /health.
  app.use('/', redirectRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
