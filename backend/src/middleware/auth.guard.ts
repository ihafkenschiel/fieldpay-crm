import type { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service.js';

const authService = new AuthService();

/**
 * Fastify preHandler hook that validates the Bearer token.
 * Attaches the authenticated user to the request.
 */
export async function authGuard(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.slice(7);
  const user = await authService.validateToken(token);

  if (!user) {
    return reply.status(401).send({ error: 'Invalid or expired token' });
  }

  // Attach user to request for downstream handlers
  (request as any).user = user;
}
