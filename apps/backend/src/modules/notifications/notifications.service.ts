import { prisma } from '../../config/database';
import type { NotificationType } from '@townly/shared';
import { getUsersNearPoint } from '../reports/reports.geo';
import { sendPushNotifications, buildNewReportMessage } from './push.service';

interface NotifyInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  reportId?: string | null;
}

/** Persist a notification row only. */
export function createNotification(input: NotifyInput) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      reportId: input.reportId ?? null,
    },
  });
}

/**
 * Persist a notification AND deliver an Expo push if the recipient has a token.
 * Push failures never block the write — delivery is best-effort.
 */
export async function notifyUser(input: NotifyInput) {
  const notification = await createNotification(input);
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { expoPushToken: true },
  });
  if (user?.expoPushToken) {
    await sendPushNotifications([
      {
        to: user.expoPushToken,
        title: input.title,
        body: input.body,
        sound: 'default',
        data: { reportId: input.reportId ?? undefined, type: input.type },
      },
    ]).catch((err) => console.error('[notifications] push failed:', err));
  }
  return notification;
}

export function listNotifications(userId: string, limit = 50) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export function unreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, read: false } });
}

/** Mark the given notifications read — scoped to the owner so ids can't be spoofed. */
export async function markRead(userId: string, ids: string[]): Promise<number> {
  if (ids.length === 0) return 0;
  const result = await prisma.notification.updateMany({
    where: { userId, id: { in: ids } },
    data: { read: true },
  });
  return result.count;
}

interface FanOutReport {
  id: string;
  title: string;
  category: string;
  latitude: number;
  longitude: number;
  authorId: string;
}

/**
 * Fan a new report out to every neighbor whose shared location + notifyRadius
 * covers it (excluding the author): one notification row each, plus an Expo push
 * for those with a token. Best-effort and fire-and-forget from the create path.
 */
export async function fanOutNewReport(report: FanOutReport): Promise<void> {
  const recipients = await getUsersNearPoint(report.latitude, report.longitude, report.authorId);
  if (recipients.length === 0) return;

  const title = `New nearby ${report.category.toLowerCase()} report`;
  await prisma.notification.createMany({
    data: recipients.map((u) => ({
      userId: u.id,
      type: 'NEW_NEARBY_REPORT' as NotificationType,
      title,
      body: report.title,
      reportId: report.id,
    })),
  });

  const messages = recipients
    .filter((u) => u.expoPushToken)
    .map((u) => buildNewReportMessage(u.expoPushToken as string, report.title, report.category, report.id));
  await sendPushNotifications(messages);
}
