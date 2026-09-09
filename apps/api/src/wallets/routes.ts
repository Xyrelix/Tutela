import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/client';
import { requireAuth } from '../auth/middleware';
import { requirePermission } from '../auth/rbac';
import { asyncHandler } from '../lib/asyncHandler';

const router = Router();

router.use(requireAuth);

const walletSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid EVM address'),
  chain: z.string().min(1),
});

router.get(
  '/',
  requirePermission('wallet:read'),
  asyncHandler(async (req, res) => {
    const wallets = await prisma.wallet.findMany({
      where: { userId: req.user!.sub },
      orderBy: { createdAt: 'desc' },
    });
    res.json(wallets);
  })
);

router.post(
  '/',
  requirePermission('wallet:write'),
  asyncHandler(async (req, res) => {
    const parsed = walletSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const wallet = await prisma.wallet.create({
      data: { ...parsed.data, userId: req.user!.sub },
    });
    res.status(201).json(wallet);
  })
);

router.delete(
  '/:id',
  requirePermission('wallet:write'),
  asyncHandler(async (req, res) => {
    const wallet = await prisma.wallet.findUnique({ where: { id: req.params.id } });
    if (!wallet || wallet.userId !== req.user!.sub) {
      res.status(404).json({ error: 'Wallet not found' });
      return;
    }

    await prisma.wallet.delete({ where: { id: wallet.id } });
    res.status(204).send();
  })
);

export default router;
