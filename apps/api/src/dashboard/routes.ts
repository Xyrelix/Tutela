import { Router } from 'express';
import { prisma } from '../db/client';
import { requireAuth } from '../auth/middleware';
import { requirePermission } from '../auth/rbac';
import { asyncHandler } from '../lib/asyncHandler';
import { getContractLabel } from '../lib/contract-labels';

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
    res.json(
      scans.map((scan) => ({
        ...scan,
        spenderLabel: scan.spender ? getContractLabel(scan.spender) : null,
      }))
    );
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
    res.json(
      approvals.map((approval) => ({
        ...approval,
        spenderLabel: getContractLabel(approval.spender),
      }))
    );
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
    res.json(
      alerts.map((alert) => ({
        ...alert,
        spenderLabel: alert.spender ? getContractLabel(alert.spender) : null,
      }))
    );
  })
);

export default router;