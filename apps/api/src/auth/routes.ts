import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../db/client';
import { asyncHandler } from '../lib/asyncHandler';

const router = Router();

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function signToken(user: { id: string; role: string; permissions: string[] }) {
  return jwt.sign(
    { sub: user.id, role: user.role, permissions: user.permissions },
    process.env.JWT_SECRET as string,
    { expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as jwt.SignOptions['expiresIn'] }
  );
}

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const parsed = credentialsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const { email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { email, passwordHash } });

    const token = signToken({ id: user.id, role: user.role, permissions: user.permissions });
    res.status(201).json({ token });
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const parsed = credentialsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = signToken({ id: user.id, role: user.role, permissions: user.permissions });
    res.json({ token });
  })
);

export default router;
