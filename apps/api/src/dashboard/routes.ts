import { Router } from 'express';
import { prisma } from '../db/client';
import { requireAuth } from '../auth/middleware';
import { requirePermission } from '../auth/rbac';
import { asyncHandler } from '../lib/asyncHandler';

const router = Router();
router.use(requireAuth, requirePermission('alert:read'));

router.get(
  '/scans',
  asyncHandler(async (req, res) => {
    const scans = await prisma.scan.findMany({
      where: { wallet: { userId: req.user!.sub } },
      include: { wallet: { select: { address: true, chain: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json(scans);
  })
);

router.get(
  '/approvals',
  asyncHandler(async (req, res) => {
    const approvals = await prisma.approval.findMany({
      where: { wallet: { userId: req.user!.sub } },
      include: { wallet: { select: { address: true, chain: true } } },
      orderBy: { detectedAt: 'desc' },
      take: 100,
    });
    res.json(approvals);
  })
);

router.get(
  '/alerts',
  asyncHandler(async (req, res) => {
    const alerts = await prisma.alert.findMany({
      where: { wallet: { userId: req.user!.sub } },
      include: { wallet: { select: { address: true, chain: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json(alerts);
  })
);

export default router;