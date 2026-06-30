import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import { prisma } from '../../config/database';
import { redis } from '../../config/redis';

const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL_DAYS = 30;
const REFRESH_TOKEN_TTL_MS = REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;

/** Fields safe to return to the client — never the password hash. */
export const PUBLIC_USER_SELECT = {
  id: true,
  username: true,
  email: true,
  avatarUrl: true,
  credibilityScore: true,
  totalReports: true,
  accurateReports: true,
  notifyRadius: true,
  createdAt: true,
} as const;

interface PublicUserRow {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  credibilityScore: number;
  totalReports: number;
  accurateReports: number;
  notifyRadius: number;
  createdAt: Date | string;
}

/** Maps a user row to the `@townly/shared` User shape (plus email/notifyRadius). */
export function toPublicUser(u: PublicUserRow) {
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    avatarUrl: u.avatarUrl ?? null,
    credibilityScore: u.credibilityScore,
    totalReports: u.totalReports,
    accurateReports: u.accurateReports,
    notifyRadius: u.notifyRadius,
    createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
  };
}

export async function createUser(username: string, email: string, password: string) {
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  return prisma.user.create({
    data: { username, email, passwordHash },
    select: PUBLIC_USER_SELECT,
  });
}

export async function verifyPassword(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  const match = await bcrypt.compare(password, user.passwordHash);
  return match ? user : null;
}

export async function createRefreshToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
  await prisma.refreshToken.create({ data: { token, userId, expiresAt } });
  return token;
}

export async function rotateRefreshToken(oldToken: string) {
  const record = await prisma.refreshToken.findUnique({
    where: { token: oldToken },
    include: { user: true },
  });
  if (!record || record.expiresAt < new Date()) return null;

  await prisma.refreshToken.delete({ where: { id: record.id } });
  const newToken = await createRefreshToken(record.userId);
  return { user: record.user, refreshToken: newToken };
}

export async function revokeRefreshToken(token: string): Promise<void> {
  await prisma.refreshToken.deleteMany({ where: { token } });
}

export async function savePushToken(userId: string, expoPushToken: string): Promise<void> {
  await prisma.user.update({ where: { id: userId }, data: { expoPushToken } });
}

/** Persist the user's coarse location, used for "new nearby report" fan-out. */
export async function saveLocation(userId: string, latitude: number, longitude: number): Promise<void> {
  await prisma.user.update({ where: { id: userId }, data: { latitude, longitude } });
}

export { ACCESS_TOKEN_TTL };
