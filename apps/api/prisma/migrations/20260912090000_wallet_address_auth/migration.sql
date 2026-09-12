ALTER TABLE "User" ADD COLUMN "walletAddress" TEXT;

UPDATE "User"
SET "walletAddress" = '0x' || md5("id") || substring(md5("id"), 1, 8)
WHERE "walletAddress" IS NULL;

ALTER TABLE "User" ALTER COLUMN "walletAddress" SET NOT NULL;
ALTER TABLE "User" DROP COLUMN "email";
ALTER TABLE "User" DROP COLUMN "passwordHash";
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");