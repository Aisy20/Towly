import { FastifyInstance } from 'fastify';
import * as authService from './auth.service';
import { loginSchema, pushTokenSchema, refreshSchema, registerSchema } from './auth.schema';

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', { schema: registerSchema }, async (request, reply) => {
    const { username, email, password } = request.body as {
      username: string;
      email: string;
      password: string;
    };

    const existing = await app.prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      return reply.status(409).send({ error: 'Username or email already taken' });
    }

    const user = await authService.createUser(username, email, password);
    const accessToken = app.jwt.sign({ sub: user.id }, { expiresIn: authService.ACCESS_TOKEN_TTL });
    const refreshToken = await authService.createRefreshToken(user.id);

    return reply.status(201).send({ user: authService.toPublicUser(user), accessToken, refreshToken });
  });

  app.post('/login', { schema: loginSchema }, async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string };

    const user = await authService.verifyPassword(email, password);
    if (!user) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const accessToken = app.jwt.sign({ sub: user.id }, { expiresIn: authService.ACCESS_TOKEN_TTL });
    const refreshToken = await authService.createRefreshToken(user.id);

    return reply.send({
      user: authService.toPublicUser(user),
      accessToken,
      refreshToken,
    });
  });

  app.post('/refresh', { schema: refreshSchema }, async (request, reply) => {
    const { refreshToken } = request.body as { refreshToken: string };

    const result = await authService.rotateRefreshToken(refreshToken);
    if (!result) {
      return reply.status(401).send({ error: 'Invalid or expired refresh token' });
    }

    const accessToken = app.jwt.sign(
      { sub: result.user.id },
      { expiresIn: authService.ACCESS_TOKEN_TTL },
    );

    return reply.send({ accessToken, refreshToken: result.refreshToken });
  });

  app.post('/logout', { schema: refreshSchema }, async (request, reply) => {
    const { refreshToken } = request.body as { refreshToken: string };
    await authService.revokeRefreshToken(refreshToken);
    return reply.status(204).send();
  });

  app.post(
    '/push-token',
    { schema: pushTokenSchema, preHandler: [app.authenticate] },
    async (request, reply) => {
      const userId = (request.user as { sub: string }).sub;
      const { expoPushToken } = request.body as { expoPushToken: string };
      await authService.savePushToken(userId, expoPushToken);
      return reply.status(204).send();
    },
  );

  app.post(
    '/location',
    { schema: locationSchema, preHandler: [app.authenticate] },
    async (request, reply) => {
      const userId = (request.user as { sub: string }).sub;
      const { latitude, longitude } = request.body as { latitude: number; longitude: number };
      await authService.saveLocation(userId, latitude, longitude);
      return reply.status(204).send();
    },
  );
}

const locationSchema = {
  body: {
    type: 'object',
    required: ['latitude', 'longitude'],
    additionalProperties: false,
    properties: {
      latitude: { type: 'number', minimum: -90, maximum: 90 },
      longitude: { type: 'number', minimum: -180, maximum: 180 },
    },
  },
} as const;
