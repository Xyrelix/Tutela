import { prisma } from '../db/client';
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
  await Promise.allSettled([
    user.telegramChatId ? sendTelegramAlert(user.telegramChatId, alert.message) : Promise.resolve(),
  ]);

  await prisma.alert.update({ where: { id: alert.id }, data: { sent: true } });
}
