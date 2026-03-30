import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const querySchema = z.object({
  pincode: z.string().length(6),
  complaint_category: z.string().optional()
});

export default async function (server: FastifyInstance) {
  server.get('/', async (request, reply) => {
    try {
      const query = querySchema.parse(request.query);
      
      // MOCK IMPLEMENTATION
      // Simulating proxy output from NHA ABDM API
      
      return {
        facilities: [
          { name: 'District Hospital', distance_km: 1.2, accepts_pmjay: true, esanjeevani_available: true, opd_hours: '9 AM - 4 PM' },
          { name: 'Primary Health Centre (PHC)', distance_km: 4.5, accepts_pmjay: true, esanjeevani_available: false, opd_hours: '10 AM - 2 PM' },
          { name: 'City Care Hospital', distance_km: 7.8, accepts_pmjay: false, esanjeevani_available: false, opd_hours: '24 Hours' }
        ],
        pincode_searched: query.pincode
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
