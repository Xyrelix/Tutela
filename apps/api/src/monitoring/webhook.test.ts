import crypto from 'crypto';
import express, { Request } from 'express';
import request from 'supertest';
import { MaxUint256 } from 'ethers';
import webhookRouter, { processLogs } from './webhook';
import { prisma } from '../db/client';
import { reasonAboutApproval } from '../decision-engine/llmReasoning';
import { getSpenderInfo } from '../decision-engine/spenderInfo';
import { dispatchAlert } from '../actions/alerts';

jest.mock('../db/client', () => ({
  prisma: {
    wallet: { findMany: jest.fn() },
    scan: { create: jest.fn() },
    approval: { create: jest.fn() },
    alert: { create: jest.fn() },
  },
}));
jest.mock('../decision-engine/llmReasoning', () => ({ reasonAboutApproval: jest.fn() }));
jest.mock('../decision-engine/spenderInfo', () => ({ getSpenderInfo: jest.fn() }));
jest.mock('../actions/alerts', () => ({ dispatchAlert: jest.fn() }));

const db = prisma as unknown as {
  wallet: { findMany: jest.Mock };
  scan: { create: jest.Mock };
  approval: { create: jest.Mock };
  alert: { create: jest.Mock };
};

const APPROVAL_TOPIC = '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925';
const WALLET = '0x1111111111111111111111111111111111111111';
const SPENDER = '0x2222222222222222222222222222222222222222';
const TOKEN = '0x3333333333333333333333333333333333333333';
const UNLIMITED = `0x${MaxUint256.toString(16)}`;

const topicFor = (address: string) => `0x${'0'.repeat(24)}${address.slice(2).toLowerCase()}`;

function approvalLog(from: string, amount: string, spender = SPENDER) {
  return {
    topics: [APPROVAL_TOPIC, topicFor(from), topicFor(spender)],
    data: amount,
    account: { address: TOKEN },
    transaction: { hash: '0xabc', from: { address: from } },
  };
}

function monitoredWallet(plan: string, address = WALLET) {
  return { id: 'wallet1', address, chain: 'ethereum', user: { plan } };
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  db.wallet.findMany.mockResolvedValue([]);
  db.alert.create.mockResolvedValue({ id: 'alert1' });
});

describe('POST /alchemy', () => {
  const app = express();
  app.use(
    express.json({
      verify: (req, _res, buf) => {
        (req as Request).rawBody = buf.toString('utf8');
      },
    })
  );
  app.use(webhookRouter);

  const body = JSON.stringify({ webhookId: 'wh', event: { data: { block: { logs: [approvalLog(WALLET, '0x1')] } } } });
  const sign = (key: string) => crypto.createHmac('sha256', key).update(body, 'utf8').digest('hex');
  const post = (path: string, key?: string) => {
    const req = request(app).post(path).set('content-type', 'application/json');
    return (key ? req.set('x-alchemy-signature', sign(key)) : req).send(body);
  };
  // Processing runs on a queue after the 200 is sent; with mocked I/O one tick drains it.
  const flushQueue = () => new Promise((resolve) => setImmediate(resolve));

  beforeAll(() => {
    process.env.ALCHEMY_WEBHOOK_SIGNING_KEY = 'key-sepolia, key-arc';
  });

  it('rejects a delivery with no signature', async () => {
    expect((await post('/alchemy')).status).toBe(401);
    await flushQueue();
    expect(db.wallet.findMany).not.toHaveBeenCalled();
  });

  it('rejects a delivery signed with an unknown key', async () => {
    expect((await post('/alchemy', 'not-a-real-key')).status).toBe(401);
  });

  it('rejects an unsupported chain even when the signature is valid', async () => {
    expect((await post('/alchemy?chain=polygon', 'key-sepolia')).status).toBe(400);
  });

  it('accepts any configured key and matches wallets on the chain from the URL', async () => {
    expect((await post('/alchemy?chain=arc-testnet', 'key-arc')).status).toBe(200);
    await flushQueue();
    expect(db.wallet.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ chain: 'arc-testnet' }) })
    );
  });

  it('defaults to ethereum when no chain is given', async () => {
    await post('/alchemy', 'key-sepolia');
    await flushQueue();
    expect(db.wallet.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ chain: 'ethereum' }) })
    );
  });
});

describe('processLogs', () => {
  it('skips logs that are not shaped like an Approval without touching the database', async () => {
    await processLogs([{ ...approvalLog(WALLET, '0x1'), topics: [APPROVAL_TOPIC] }], 'ethereum');
    expect(db.wallet.findMany).not.toHaveBeenCalled();
  });

  it('ignores approvals from wallets nobody monitors', async () => {
    await processLogs([approvalLog(WALLET, UNLIMITED)], 'ethereum');
    expect(db.scan.create).not.toHaveBeenCalled();
  });

  it('records a bounded approval as safe with no alert', async () => {
    db.wallet.findMany.mockResolvedValue([monitoredWallet('free')]);
    await processLogs([approvalLog(WALLET, '0x3e8')], 'ethereum');

    expect(db.scan.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ walletId: 'wallet1', spender: SPENDER, verdict: 'safe', txHash: '0xabc' }),
    });
    expect(db.approval.create).not.toHaveBeenCalled();
    expect(dispatchAlert).not.toHaveBeenCalled();
  });

  it('matches a monitored wallet regardless of address casing', async () => {
    db.wallet.findMany.mockResolvedValue([monitoredWallet('free', '0xAbCdEf0000000000000000000000000000000001')]);
    await processLogs([approvalLog('0xabcdef0000000000000000000000000000000001', '0x1')], 'ethereum');
    expect(db.scan.create).toHaveBeenCalledTimes(1);
  });

  it('flags an unlimited approval as suspicious for free plans without calling the AI', async () => {
    db.wallet.findMany.mockResolvedValue([monitoredWallet('free')]);
    await processLogs([approvalLog(WALLET, UNLIMITED)], 'ethereum');

    expect(reasonAboutApproval).not.toHaveBeenCalled();
    expect(db.scan.create).toHaveBeenCalledWith({ data: expect.objectContaining({ verdict: 'suspicious', riskScore: 60 }) });
    expect(db.approval.create).toHaveBeenCalledWith({
      data: { walletId: 'wallet1', spender: SPENDER, tokenAddress: TOKEN, amount: MaxUint256.toString() },
    });
    expect(db.alert.create).toHaveBeenCalledWith({ data: expect.objectContaining({ type: 'risky_approval' }) });
    expect(dispatchAlert).toHaveBeenCalledWith('alert1');
  });

  it('asks the AI with spender facts for paid plans and uses its verdict', async () => {
    const spenderInfo = { isContract: false, verified: null, contractName: null, ageDays: null };
    db.wallet.findMany.mockResolvedValue([monitoredWallet('sentinel')]);
    (getSpenderInfo as jest.Mock).mockResolvedValue(spenderInfo);
    (reasonAboutApproval as jest.Mock).mockResolvedValue({ verdict: 'malicious', riskScore: 95, reasoning: 'EOA drainer' });

    await processLogs([approvalLog(WALLET, UNLIMITED)], 'base');

    expect(getSpenderInfo).toHaveBeenCalledWith(SPENDER, 'base');
    expect(reasonAboutApproval).toHaveBeenCalledWith(expect.objectContaining({ spender: SPENDER, spenderInfo }));
    expect(db.scan.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ verdict: 'malicious', riskScore: 95, reasoning: 'EOA drainer' }),
    });
    expect(db.alert.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ type: 'drainer_contract', message: 'EOA drainer' }),
    });
  });
});
