import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/client';
import { requireAuth } from '../auth/middleware';
import { requirePermission } from '../auth/rbac';
import { asyncHandler } from '../lib/asyncHandler';
import { buildRevokeTransaction } from './revoke';
import { generateTelegramLinkCode } from './telegramBot';

const router = Router();

router.use(requireAuth);

router.post(
  '/telegram/link-code',
  asyncHandler(async (req, res) => {
    const result = await generateTelegramLinkCode(req.user!.sub);
    res.json(result);
  })
);

async function loadOwnedApproval(approvalId: string, userId: string) {
  const approval = await prisma.approval.findUnique({
    where: { id: approvalId },
    include: { wallet: true },
  });
  if (!approval || approval.wallet.userId !== userId) {
    return null;
  }
  return approval;
}

router.get(
  '/revoke/:approvalId',
  requirePermission('wallet:write'),
  asyncHandler(async (req, res) => {
    const approval = await loadOwnedApproval(req.params.approvalId, req.user!.sub);
    if (!approval) {
      res.status(404).json({ error: 'Approval not found' });
      return;
    }

    res.json(buildRevokeTransaction(approval.tokenAddress, approval.spender));
  })
);

const confirmSchema = z.object({ txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/) });

router.post(
  '/revoke/:approvalId/confirm',
  requirePermission('wallet:write'),
  asyncHandler(async (req, res) => {
    const approval = await loadOwnedApproval(req.params.approvalId, req.user!.sub);
    if (!approval) {
      res.status(404).json({ error: 'Approval not found' });
      return;
    }

    const parsed = confirmSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const updated = await prisma.approval.update({
      where: { id: approval.id },
      data: { status: 'revoked', revokeTxHash: parsed.data.txHash },
    });

    res.json(updated);
  })
);

export default router;
