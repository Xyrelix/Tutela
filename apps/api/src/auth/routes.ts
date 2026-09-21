import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { verifyMessage } from 'ethers';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { prisma } from '../db/client';
import { asyncHandler } from '../lib/asyncHandler';
import { requireAuth } from './middleware';

const router = Router();
const challenges = new Map<string, { walletAddress: string; mode: 'login' | 'register'; issuedAt: number }>();
const CHALLENGE_TTL_MS = 5 * 60 * 1000;

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again later.' },
});

const walletAuthSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
});

function signToken(user: { id: string; role: string; permissions: string[] }) {
  return jwt.sign(
    { sub: user.id, role: user.role, permissions: user.permissions },
    process.env.JWT_SECRET as string,
    { algorithm: 'HS256', expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as jwt.SignOptions['expiresIn'] }
  );
}

router.post(
  '/challenge',
  authLimiter,
  asyncHandler(async (req, res) => {
    const parsed = walletAuthSchema.extend({ mode: z.enum(['login', 'register']) }).safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const walletAddress = parsed.data.walletAddress.toLowerCase();
    const nonce = randomUUID();
    const issuedAt = Date.now();
    const message = [
      'Tutela wants you to sign in with your Ethereum account:',
      walletAddress,
      '',
      parsed.data.mode === 'register' ? 'Create your Tutela account.' : 'Sign in to Tutela.',
      '',
      `Nonce: ${nonce}`,
      `Issued At: ${new Date(issuedAt).toISOString()}`,
    ].join('\n');

    challenges.set(nonce, { walletAddress, mode: parsed.data.mode, issuedAt });
    res.json({ message });
  })
);

router.post(
  '/verify',
  authLimiter,
  asyncHandler(async (req, res) => {
    const parsed = z.object({ message: z.string(), signature: z.string() }).safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const nonceMatch = parsed.data.message.match(/Nonce: ([^\n]+)/);
    const nonce = nonceMatch?.[1];
    if (!nonce) {
      res.status(401).json({ error: 'Challenge nonce is missing' });
      return;
    }

    const challenge = challenges.get(nonce);
    if (!challenge || Date.now() - challenge.issuedAt > CHALLENGE_TTL_MS) {
      if (nonce) challenges.delete(nonce);
      res.status(401).json({ error: 'Challenge expired or not found' });
      return;
    }

    let recoveredAddress: string;
    try {
      recoveredAddress = (await verifyMessage(parsed.data.message, parsed.data.signature)).toLowerCase();
    } catch {
      res.status(401).json({ error: 'Invalid wallet signature' });
      return;
    }

    challenges.delete(nonce);
    if (recoveredAddress !== challenge.walletAddress) {
      res.status(401).json({ error: 'Signature does not match wallet address' });
      return;
    }

    let user = await prisma.user.findUnique({ where: { walletAddress: challenge.walletAddress } });
    if (challenge.mode === 'register') {
      if (user) {
        res.status(409).json({ error: 'Wallet address already registered' });
        return;
      }
      user = await prisma.user.create({ data: { walletAddress: challenge.walletAddress } });
    } else if (!user) {
      res.status(401).json({ error: 'Wallet address is not registered' });
      return;
    }

    res.json({ token: signToken({ id: user.id, role: user.role, permissions: user.permissions }) });
  })
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user.id,
      walletAddress: user.walletAddress,
      role: user.role,
      plan: user.plan,
      telegramLinked: Boolean(user.telegramChatId),
    });
  })
);

export default router;
