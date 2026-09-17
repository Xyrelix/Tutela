import { prisma } from '../db/client';
import { isPro } from '../lib/plans';
import { telegramBot } from './telegramBot';

export async function sendTelegramAlert(chatId: string, message: string): Promise<void> {
  if (!telegramBot) {
    return;
  }
  await telegramBot.telegram.sendMessage(chatId, message);
}

export async function dispatchAlert(alertId: string): Promise<void> {
  const alert = await prisma.alert.findUnique({
    where: { id: alertId },
    include: { wallet: { include: { user: true } } },
  });
  if (!alert) {
    return;
  }

  const { user } = alert.wallet;
  const canReceiveTelegram = Boolean(user.telegramChatId) && isPro(user.plan);
  await Promise.allSettled([
    canReceiveTelegram
      ? sendTelegramAlert(user.telegramChatId as string, alert.message)
      : Promise.resolve(),
  ]);

  await prisma.alert.update({ where: { id: alert.id }, data: { sent: true } });
}
