import { PrismaClient } from '@prisma/client';
import knownDrainers from '../src/decision-engine/known-drainers.json';

const prisma = new PrismaClient();

// Throwaway demo keypair — holds no funds, safe to commit for a live demo login.
//   address:    0xBd35e3bBE78c8E188d50345a4f9Ff236eD2795a5
//   privateKey: 0x0364d4408a75078ad3673fef409602e6ebc4a0f699e74bf85b826a9c66ccfe74
const DEMO_WALLET_ADDRESS = '0xbd35e3bbe78c8e188d50345a4f9ff236ed2795a5';

const PERSONAL_WALLET = '0x3f5d59636c5ca924c7978c24841d0481a2a7ca73';
const TREASURY_WALLET = '0xc7c4fbea8b6ec19ce5e248d7169089a13b37b067';
const REVOKED_SPENDER = '0x20382f2af97050094de5d9fe04bcb4bc59465577';
const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
const WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
const UNLIMITED = '115792089237316195423570985008687907853269984665640564039457584007913129639935';

async function main() {
  const user = await prisma.user.upsert({
    where: { walletAddress: DEMO_WALLET_ADDRESS },
    update: {},
    create: { walletAddress: DEMO_WALLET_ADDRESS, plan: 'pro' },
  });

  const personalWallet = await prisma.wallet.upsert({
    where: {
      address_chain_userId: { address: PERSONAL_WALLET, chain: 'ethereum', userId: user.id },
    },
    update: {},
    create: { address: PERSONAL_WALLET, chain: 'ethereum', userId: user.id },
  });

  const treasuryWallet = await prisma.wallet.upsert({
    where: {
      address_chain_userId: { address: TREASURY_WALLET, chain: 'base', userId: user.id },
    },
    update: {},
    create: { address: TREASURY_WALLET, chain: 'base', userId: user.id },
  });

  const demoWalletIds = [personalWallet.id, treasuryWallet.id];
  await prisma.alert.deleteMany({ where: { walletId: { in: demoWalletIds } } });
  await prisma.approval.deleteMany({ where: { walletId: { in: demoWalletIds } } });
  await prisma.scan.deleteMany({ where: { walletId: { in: demoWalletIds } } });

  await prisma.scan.create({
    data: {
      walletId: personalWallet.id,
      riskScore: 8,
      verdict: 'safe',
      reasoning: 'No known risk indicators',
    },
  });

  const drainerReasoning = 'Spender matches known drainer contract list';
  await prisma.scan.create({
    data: {
      walletId: treasuryWallet.id,
      riskScore: 100,
      verdict: 'malicious',
      reasoning: drainerReasoning,
    },
  });

  await prisma.approval.create({
    data: {
      walletId: treasuryWallet.id,
      spender: knownDrainers[0],
      tokenAddress: USDC,
      amount: UNLIMITED,
      status: 'active',
    },
  });

  await prisma.alert.create({
    data: { walletId: treasuryWallet.id, type: 'drainer_contract', message: drainerReasoning },
  });

  const suspiciousReasoning = 'Unlimited (MaxUint256) approval amount on a newly-seen contract';
  await prisma.scan.create({
    data: {
      walletId: treasuryWallet.id,
      riskScore: 62,
      verdict: 'suspicious',
      reasoning: suspiciousReasoning,
    },
  });

  await prisma.approval.create({
    data: {
      walletId: treasuryWallet.id,
      spender: REVOKED_SPENDER,
      tokenAddress: WETH,
      amount: UNLIMITED,
      status: 'revoked',
      revokeTxHash: `0x${'7'.repeat(64)}`,
    },
  });

  await prisma.alert.create({
    data: {
      walletId: treasuryWallet.id,
      type: 'risky_approval',
      message: suspiciousReasoning,
      sent: true,
    },
  });

  console.log('Seeded demo data for user', user.id);
  console.log('');
  console.log('Demo login (import into a browser wallet to sign in as this account):');
  console.log('  address:    0xBd35e3bBE78c8E188d50345a4f9Ff236eD2795a5');
  console.log('  privateKey: 0x0364d4408a75078ad3673fef409602e6ebc4a0f699e74bf85b826a9c66ccfe74');
  console.log('This is a throwaway demo-only key with zero funds — never use it for anything real.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
