/**
 * Expo Push Notification Service
 * Sends push notifications via the Expo Push API.
 * Tokens are stored per-user as `expoPushToken`.
 */

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default';
  badge?: number;
}

interface ExpoPushTicket {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: { error?: string };
}

const EXPO_PUSH_ENDPOINT = 'https://exp.host/--/api/v2/push/send';

export async function sendPushNotifications(
  messages: ExpoPushMessage[],
): Promise<void> {
  if (messages.length === 0) return;

  // Expo accepts up to 100 messages per request
  const chunks = chunkArray(messages, 100);

  await Promise.allSettled(
    chunks.map(async (chunk) => {
      const res = await fetch(EXPO_PUSH_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(chunk),
      });

      const data = await res.json() as { data: ExpoPushTicket[] };
      for (const ticket of data.data) {
        if (ticket.status === 'error') {
          console.error('[push] delivery error:', ticket.message, ticket.details);
        }
      }
    }),
  );
}

export function buildNewReportMessage(
  token: string,
  reportTitle: string,
  category: string,
  reportId: string,
): ExpoPushMessage {
  return {
    to: token,
    title: `New nearby ${category.toLowerCase()} report`,
    body: reportTitle,
    sound: 'default',
    data: { reportId, type: 'NEW_NEARBY_REPORT' },
  };
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}
