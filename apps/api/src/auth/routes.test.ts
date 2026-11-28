import express from 'express';
import request from 'supertest';
import { Wallet } from 'ethers';
import authRouter from './routes';
import { prisma } from '../db/client';

jest.mock('../db/client', () => {
  const tx = { user: { create: jest.fn() }, wallet: { create: jest.fn() } };
  return {
    prisma: {
      user: { findUnique: jest.fn() },
      $transaction: jest.fn((fn: (t: typeof tx) => unknown) => fn(tx)),
      tx,
    },
  };
});

const db = prisma as unknown as {
  user: { findUnique: jest.Mock };
  tx: { user: { create: jest.Mock }; wallet: { create: jest.Mock } };
};
const app = express().use(express.json()).use('/auth', authRouter);
const USER = { id: 'u1', role: 'user', permissions: [] };

async function signIn(mode: string) {
  const wallet = Wallet.createRandom();
  const { body } = await request(app).post('/auth/challenge').send({ walletAddress: wallet.address, mode });
  const signature = await wallet.signMessage(body.message);
  return request(app).post('/auth/verify').send({ message: body.message, signature });
}

describe('wallet auth', () => {
  beforeAll(() => (process.env.JWT_SECRET = 'test-secret'));
  beforeEach(() => jest.clearAllMocks());

  it('continue creates the account for a new wallet', async () => {
    db.user.findUnique.mockResolvedValue(null);
    db.tx.user.create.mockResolvedValue(USER);
    const res = await signIn('continue');
    expect(res.status).toBe(200);
    expect(db.tx.user.create).toHaveBeenCalled();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('continue signs in an existing wallet without creating anything', async () => {
    db.user.findUnique.mockResolvedValue(USER);
    const res = await signIn('continue');
    expect(res.status).toBe(200);
    expect(db.tx.user.create).not.toHaveBeenCalled();
  });

  it('login still rejects an unknown wallet, register still rejects a known one', async () => {
    db.user.findUnique.mockResolvedValue(null);
    expect((await signIn('login')).status).toBe(401);
    db.user.findUnique.mockResolvedValue(USER);
    expect((await signIn('register')).status).toBe(409);
  });
});
