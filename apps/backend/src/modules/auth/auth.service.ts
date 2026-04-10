import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import { prisma } from '../../config/database';
import { redis } from '../../config/redis';

const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL_DAYS = 30;
const REFRESH_TOKEN_TTL_MS = REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;

export async function createUser(username: string, email: string, password: string) {
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  return prisma.user.create({
    data: { username, email, passwordHash },
    select: { id: true, username: true, email: true, credibilityScore: true, createdAt: true },
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

export { ACCESS_TOKEN_TTL };
