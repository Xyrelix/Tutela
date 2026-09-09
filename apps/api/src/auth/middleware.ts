import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthPayload {
  sub: string;
  role: string;
  permissions: string[];
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export const requireAuth: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing bearer token' });
    return;
  }

  const token = header.slice('Bearer '.length);

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET as string) as AuthPayload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
