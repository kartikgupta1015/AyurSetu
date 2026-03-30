import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { translateText } from '../services/indictrans';
import { searchClaim } from '../services/fuse';

const bodySchema = z.object({
  text: z.string().min(1),
  language: z.string().optional().default('hi')
});

export default async function (server: FastifyInstance) {
  server.post('/', async (request, reply) => {
    try {
      const body = bodySchema.parse(request.body);
      
      // 1. Translate input to English specifically for checking against English CSVs
      const englishText = await translateText(body.text, body.language, 'en');
      
      // 2. Perform local fuzzy search against loaded dataset
      const match = searchClaim(englishText);
      
      let verdict = 'UNVERIFIED';
      let explanationEn = 'We could not verify this claim against our official Indian health databases. Please do not forward this message blindly.';
      let sources: string[] = [];
      let safety_note: string | null = null;
      let confidence = 0.0;

      // 3. Since the db is populated exclusively with debunked misinformation (per WHO tables),
      // any resulting hit is inherently a FALSE or 'GALAT' claim.
      if (match) {
        verdict = 'GALAT';
        explanationEn = `According to official sources, the claim "${match.item.claim_english}" is totally false and has been debunked.`;
        sources = [match.item.source];
        safety_note = 'Do not follow this advice. Relying on misinformation can lead to severe health hazards.';
        confidence = parseFloat((1.0 - match.score!).toFixed(2));
      }
      
      // 4. Translate fallback response
      let explanationHi = explanationEn;
      if (body.language !== 'en') {
        explanationHi = await translateText(explanationEn, 'en', 'hi'); // Mock translations
        // Hardcoding standard Hindi response so frontend looks nice on mock
        if (verdict === 'GALAT') {
          explanationHi = `आधिकारिक स्वास्थ्य डेटाबेस के अनुसार, "${match?.item.claim_english}" का दावा पूरी तरह से गलत (FALSE) है। कृपया इस भ्रामक संदेश को आगे फॉरवर्ड न करें।`;
        } else {
          explanationHi = `हम अपने आधिकारिक स्वास्थ्य डेटाबेस से इस दावे की पुष्टि नहीं कर पाए। इसे आगे साझा करने से बचें।`;
        }
      }
      
      return {
        verdict,
        explanation_hindi: explanationHi,
        explanation_english: explanationEn,
        sources,
        confidence_score: confidence,
        card_url: "https://via.placeholder.com/800x400.png?text=Verified+by+Aarogya+Vaad",
        safety_note
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
