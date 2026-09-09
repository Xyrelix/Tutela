-- AlterTable
ALTER TABLE "Approval" ADD COLUMN     "revokeTxHash" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "telegramLinkCode" TEXT,
ADD COLUMN     "telegramLinkCodeExpiresAt" TIMESTAMP(3);
