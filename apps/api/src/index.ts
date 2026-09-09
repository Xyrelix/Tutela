import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import authRoutes from './auth/routes';
import walletRoutes from './wallets/routes';
import webhookRoutes from './monitoring/webhook';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as Request).rawBody = buf.toString('utf8');
    },
  })
);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/webhooks', webhookRoutes);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`Tutela API listening on port ${port}`);
});
