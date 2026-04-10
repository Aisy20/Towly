import fp from 'fastify-plugin';
import fastifyWs from '@fastify/websocket';
import { FastifyInstance } from 'fastify';
import crypto from 'node:crypto';
import { registerConnection, removeConnection, handleClientMessage } from '../modules/websocket/ws.handler';

export default fp(async function websocketPlugin(app: FastifyInstance) {
  app.register(fastifyWs);

  app.after(() => {
    app.get('/ws', { websocket: true }, (socket, request) => {
      const id = crypto.randomUUID();

      // Authenticate via query token
      let userId = 'anonymous';
      try {
        const token = (request.query as Record<string, string>).token;
        const decoded = app.jwt.decode<{ sub: string }>(token);
        if (decoded?.sub) userId = decoded.sub;
      } catch {}

      registerConnection(id, socket, userId);
      console.log(`[ws] connected: ${id} (user: ${userId})`);

      socket.on('message', (data) => {
        handleClientMessage(id, data.toString());
      });

      socket.on('close', () => {
        removeConnection(id);
        console.log(`[ws] disconnected: ${id}`);
      });

      socket.on('error', (err) => {
        console.error(`[ws] error on ${id}:`, err);
        removeConnection(id);
      });
    });
  });
});
