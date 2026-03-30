import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { logSymptomCluster, checkAshaWorker } from '../services/pgvector';

const bodySchema = z.object({
  symptom_category: z.string(),
  pincode: z.string().length(6),
  severity: z.string().default('MEDIUM')
});

export default async function (server: FastifyInstance) {
  server.post('/', async (request, reply) => {
    try {
      const body = bodySchema.parse(request.body);
      
      // 1. Log symptom cluster
      const recentCount = await logSymptomCluster(body.pincode, body.symptom_category, body.severity);
      
      // 2. Alert threshold check
      const thresholdReached = recentCount >= 10;
      let ashaNotified = false;

      if (thresholdReached) {
        // Query ASHA DB
        const ashaWorker = await checkAshaWorker(body.pincode);
        if (ashaWorker) {
          // Trigger Twilio SMS (Mocked internally for now or actual implementation)
          console.log(`[TWILIO MOCK] SMS sent to ${ashaWorker.phone_number}: Cluster detected in ${body.pincode} for ${body.symptom_category}`);
          ashaNotified = true;
        }
      }
      
      return {
        logged: true,
        current_cluster_count: recentCount,
        alert_triggered: thresholdReached,
        asha_notified: ashaNotified
      };
    } catch (err) {
      if (err instanceof z.ZodError) {
        return reply.status(400).send({ error: err.errors });
      }
      server.log.error(err);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });
}
