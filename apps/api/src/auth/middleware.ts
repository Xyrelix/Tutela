import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { readSessionToken } from './session';

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

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

// Cross-site HTML forms can't set custom headers without a CORS preflight, so
// requiring one on state-changing requests stops cookie-riding CSRF.
export const requireAuth: RequestHandler = (req, res, next) => {
  if (!SAFE_METHODS.includes(req.method) && !req.headers['x-requested-with']) {
    res.status(403).json({ error: 'Missing X-Requested-With header' });
    return;
  }

  const token = readSessionToken(req);
  if (!token) {
    res.status(401).json({ error: 'Not signed in' });
    return;
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET as string, {
      algorithms: ['HS256'],
    }) as AuthPayload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
