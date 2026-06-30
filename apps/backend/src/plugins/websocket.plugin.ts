import fp from 'fastify-plugin';
import fastifyWs from '@fastify/websocket';
import { FastifyInstance } from 'fastify';
import type { RawData } from 'ws';
import crypto from 'node:crypto';
import { registerConnection, removeConnection, handleClientMessage } from '../modules/websocket/ws.handler';

export default fp(async function websocketPlugin(app: FastifyInstance) {
  app.register(fastifyWs);

  app.after(() => {
    app.get('/ws', { websocket: true }, (socket, request) => {
      const id = crypto.randomUUID();

      // Authenticate via query token. Verify the signature (not just decode) so
      // a forged token can't claim another user's id; fall back to anonymous
      // (read-only) on any failure.
      let userId = 'anonymous';
      try {
        const token = (request.query as Record<string, string>).token;
        const decoded = app.jwt.verify<{ sub: string }>(token);
        if (decoded?.sub) userId = decoded.sub;
      } catch {}

      registerConnection(id, socket, userId);
      console.log(`[ws] connected: ${id} (user: ${userId})`);

      socket.on('message', (data: RawData) => {
        handleClientMessage(id, data.toString());
      });

      socket.on('close', () => {
        removeConnection(id);
        console.log(`[ws] disconnected: ${id}`);
      });

      socket.on('error', (err: Error) => {
        console.error(`[ws] error on ${id}:`, err);
        removeConnection(id);
      });
    });
  });
});
