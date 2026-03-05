import Fastify from 'fastify';
import cors from '@fastify/cors';
import { env } from './config/env.js';
import { authRoutes } from './routes/auth.routes.js';
import { salesforceRoutes } from './routes/salesforce.routes.js';
import { stripeRoutes } from './routes/stripe.routes.js';
import { syncRoutes } from './routes/sync.routes.js';

async function main() {
  const app = Fastify({
    logger: {
      level: env.nodeEnv === 'production' ? 'warn' : 'info',
      transport:
        env.nodeEnv !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
  });

  // CORS — restrict in production
  await app.register(cors, {
    origin: env.nodeEnv === 'production' ? [] : true,
    credentials: true,
  });

  // Health check
  app.get('/health', async () => ({
    status: 'ok',
    environment: env.nodeEnv,
    salesforceMode: env.salesforceMode,
    stripeMode: env.stripeMode,
    timestamp: new Date().toISOString(),
  }));

  // Register route modules
  await app.register(authRoutes);
  await app.register(salesforceRoutes);
  await app.register(stripeRoutes);
  await app.register(syncRoutes);

  // Global error handler
  app.setErrorHandler((error, request, reply) => {
    app.log.error(error);
    reply.status(error.statusCode || 500).send({
      error: error.message || 'Internal Server Error',
    });
  });

  try {
    await app.listen({ port: env.port, host: '0.0.0.0' });
    app.log.info(`🚀 Field Pay BFF running on http://localhost:${env.port}`);
    app.log.info(`   Salesforce mode: ${env.salesforceMode}`);
    app.log.info(`   Stripe mode: ${env.stripeMode}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
