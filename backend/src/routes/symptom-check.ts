import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { convertSpeechToText } from '../services/sarvam';
import { normaliseSymptoms } from '../services/claude';
import { logSymptomCluster } from '../services/pgvector';

const bodySchema = z.object({
  text: z.string().optional(),
  audio_base64: z.string().optional(),
  language: z.string().default('hi'),
  pincode: z.string().optional(), // For cluster logs
});

export default async function (server: FastifyInstance) {
  server.post('/', async (request, reply) => {
    try {
      const body = bodySchema.parse(request.body);
      
      if (!body.text && !body.audio_base64) {
        return reply.status(400).send({ error: 'Must provide text or audio input' });
      }
      
      // 1. STT if audio is provided
      const inputText = body.audio_base64 ? await convertSpeechToText(body.audio_base64, body.language) : body.text!;
      
      // 2. Normalise Symptoms via LLM
      const triage = await normaliseSymptoms(inputText);
      
      // 3. Score Severity (Map score to category)
      const severityMap: { [key: number]: string } = {
        5: 'CRITICAL',
        4: 'HIGH',
        3: 'MEDIUM',
        2: 'LOW',
        1: 'SELF-CARE'
      };
      const severity = severityMap[triage.severity_score];
      
      // 4. Log to cluster if pincode is available
      if (body.pincode && triage.symptoms.length > 0) {
        await logSymptomCluster(body.pincode, triage.symptoms[0].normalised_term, severity);
      }
      
      return {
        severity,
        action_text: triage.severity_score >= 4 ? 'तुरंत नजदीकी डॉक्टर को दिखाएं' : 
                     triage.severity_score >= 3 ? '2-3 दिन में दिखाएं' : 'घर पर देखभाल करें',
        symptoms_extracted: triage.symptoms,
        red_flags: triage.red_flags,
        requires_facility: triage.severity_score >= 3
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
