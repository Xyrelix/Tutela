import { Telegraf } from 'telegraf';
import { randomInt } from 'crypto';
import { prisma } from '../db/client';

export const telegramBot = process.env.TELEGRAM_BOT_TOKEN
  ? new Telegraf(process.env.TELEGRAM_BOT_TOKEN)
  : null;

const LINK_CODE_TTL_MS = 10 * 60 * 1000;

export interface TelegramLinkCode {
  code: string;
  expiresAt: Date;
  botUsername?: string;
}

export async function generateTelegramLinkCode(userId: string): Promise<TelegramLinkCode> {
  const code = randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + LINK_CODE_TTL_MS);

  await prisma.user.update({
    where: { id: userId },
    data: { telegramLinkCode: code, telegramLinkCodeExpiresAt: expiresAt },
  });

  return { code, expiresAt, botUsername: process.env.TELEGRAM_BOT_USERNAME };
}

export function startTelegramBot(): void {
  if (!telegramBot) {
    return;
  }

  telegramBot.start(async (ctx) => {
    const code = ctx.startPayload;
    if (!code) {
      await ctx.reply('Send /start followed by the linking code shown in your Tutela dashboard.');
      return;
    }

    const user = await prisma.user.findFirst({
      where: { telegramLinkCode: code, telegramLinkCodeExpiresAt: { gt: new Date() } },
    });

    if (!user) {
      await ctx.reply('That code is invalid or has expired. Generate a new one from the dashboard.');
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        telegramChatId: ctx.chat.id.toString(),
        telegramLinkCode: null,
        telegramLinkCodeExpiresAt: null,
      },
    });

    await ctx.reply('Your Telegram is linked to Tutela. You will receive risk alerts here.');
  });

  telegramBot.launch();
  process.once('SIGINT', () => telegramBot.stop('SIGINT'));
  process.once('SIGTERM', () => telegramBot.stop('SIGTERM'));
}
