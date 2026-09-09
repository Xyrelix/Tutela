import nodemailer, { Transporter } from 'nodemailer';
import { prisma } from '../db/client';
import { telegramBot } from './telegramBot';

let mailTransporter: Transporter | null = null;

async function getMailTransporter(): Promise<Transporter> {
  if (mailTransporter) {
    return mailTransporter;
  }

  if (process.env.SMTP_HOST) {
    mailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
    return mailTransporter;
  }

  const testAccount = await nodemailer.createTestAccount();
  mailTransporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  return mailTransporter;
}

export async function sendTelegramAlert(chatId: string, message: string): Promise<void> {
  if (!telegramBot) {
    return;
  }
  await telegramBot.telegram.sendMessage(chatId, message);
}

export async function sendEmailAlert(to: string, subject: string, message: string): Promise<void> {
  const transporter = await getMailTransporter();
  const info = await transporter.sendMail({
    from: 'Tutela <alerts@tutela.dev>',
    to,
    subject,
    text: message,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`Email preview: ${previewUrl}`);
  }
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
  const subject = `Tutela alert: ${alert.type}`;

  await Promise.allSettled([
    user.telegramChatId ? sendTelegramAlert(user.telegramChatId, alert.message) : Promise.resolve(),
    sendEmailAlert(user.email, subject, alert.message),
  ]);

  await prisma.alert.update({ where: { id: alert.id }, data: { sent: true } });
}
