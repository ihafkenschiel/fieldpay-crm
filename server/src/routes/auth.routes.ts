import type { FastifyInstance } from 'fastify';
import { AuthService } from '../services/auth.service.js';

const authService = new AuthService();

export async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: { username: string; password: string } }>('/auth/login', async (request, reply) => {
    const { username, password } = request.body;

    if (!username || !password) {
      return reply.status(400).send({ error: 'Username and password are required' });
    }

    const result = await authService.login(username, password);
    if (!result) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    return result;
  });

  app.post<{ Body: { refreshToken: string } }>('/auth/refresh', async (request, reply) => {
    const { refreshToken } = request.body;

    if (!refreshToken) {
      return reply.status(400).send({ error: 'Refresh token is required' });
    }

    const tokens = await authService.refresh(refreshToken);
    if (!tokens) {
      return reply.status(401).send({ error: 'Invalid refresh token' });
    }

    return tokens;
  });

  app.post('/auth/logout', async (request, reply) => {
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      await authService.logout(authHeader.slice(7));
    }
    return reply.status(204).send();
  });
}
