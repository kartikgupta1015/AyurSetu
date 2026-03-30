import Fastify from 'fastify';
import cors from '@fastify/cors';

// Import route handlers
import mythCheckRoutes from './routes/myth-check';
import symptomCheckRoutes from './routes/symptom-check';
import facilityLookupRoutes from './routes/facility-lookup';
import clusterReportRoutes from './routes/cluster-report';

const server = Fastify({ logger: true });

async function buildServer() {
  await server.register(cors, { 
    origin: '*' 
  });

  server.get('/health', async (request, reply) => {
    return { status: 'ok', message: 'Aarogya Vaad API running', timestamp: new Date().toISOString() };
  });

  // Register feature routes 
  await server.register(mythCheckRoutes, { prefix: '/api/myth-check' });
  await server.register(symptomCheckRoutes, { prefix: '/api/symptom-check' });
  await server.register(facilityLookupRoutes, { prefix: '/api/facility-lookup' });
  await server.register(clusterReportRoutes, { prefix: '/api/cluster-report' });

  return server;
}

const start = async () => {
  try {
    const app = await buildServer();
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3002;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`Server listening at http://localhost:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
