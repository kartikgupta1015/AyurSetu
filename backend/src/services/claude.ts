import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'mock-key',
});

// Since we fallback if API is not set, we'll keep a unified check
const USE_MOCK = !process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'mock-key';

interface TriageRule {
  keywords: string[];
  normalized_term: string;
  body_system: string;
  red_flags: string[];
  severity: number;
}
let triageRules: TriageRule[] | null = null;

function loadTriageRules() {
  if (triageRules) return;
  triageRules = [];
  
  const files = [
    'triage-guidelines.csv',
    'ada-health-ontology.csv',
    'buoy-symptom-algo.csv',
    'babylon-knowledge-graph.csv',
    'mimic-iv-triage.csv',
    'symp-ontology.csv',
    'doid-disease-ontology.csv',
    'promis-severity-scores.csv',
    'cprd-primary-care.csv',
    'ahrq-hcup-er.csv',
    'clinvar-genetics.csv',
    'who-icd-11-core.csv',
    'nhs-111-pathways.csv',
    'cdc-infectious-diseases.csv',
    'mayo-clinic-general.csv',
    'aap-pediatric-triage.csv',
    'rcog-obstetrics.csv',
    'asbestos-occupational.csv',
    'epa-environmental-toxins.csv',
    'aha-cardiovascular.csv',
    'ats-pulmonology.csv',
    'aga-gastrointestinal.csv',
    'aan-neurology.csv',
    'apa-psychiatry.csv',
    'aad-dermatology.csv',
    'aaos-orthopedic-trauma.csv',
    'aso-ophthalmology.csv',
    'ent-otolaryngology.csv',
    'endosociety-hormonal.csv',
    'auao-urology.csv',
    'acog-gynecology.csv',
    'asco-oncology-redflags.csv',
    'ash-hematology.csv',
    'aid-immunology.csv',
    'rheum-arthritis.csv',
    'id-tropical-medicine.csv',
    'geriatrics-agso.csv',
    'nida-substance-abuse.csv',
    'amssm-sports-medicine.csv',
    'wounds-burns-triage.csv',
    'dental-emergencies.csv',
  ];

  files.forEach(file => {
    const filePath = path.join(process.cwd(), '../data/symptom-triage', file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const records = parse(content, { skip_empty_lines: true });
      for (let i = 1; i < records.length; i++) {
         const row = records[i];
         if (row.length >= 5) {
           triageRules!.push({
             keywords: row[0].toLowerCase().split(',').map((k: string) => k.trim()),
             normalized_term: row[1],
             body_system: row[2],
             red_flags: row[3] ? [row[3]] : [],
             severity: parseInt(row[4]) || 1
           });
         }
      }
    }
  });
  console.log(`[Triage DB] Successfully loaded ${triageRules.length} medical ontology rules.`);
}

export async function extractHealthClaim(text: string) {
  if (USE_MOCK) {
    return {
      claim_english: "Raw garlic cures coronavirus",
      claim_type: 'cure',
      confidence: 0.95
    };
  }

  const prompt = `You are a medical claim extractor. Given a health-related message, extract the core medical claim. 
Output ONLY valid JSON:
{ 
  "claim_english": string, 
  "claim_type": "cure" | "prevention" | "diagnosis" | "remedy" | "other", 
  "confidence": number 
}

Message: ${text}`;

  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307', // using haiku for faster extraction, or sonnet if preferred
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }]
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  throw new Error("Failed to parse JSON from Claude");
}

export async function generateVerdict(claim: string, dbContext: any[]) {
  if (USE_MOCK) {
    return {
      verdict: 'GALAT',
      explanation_hindi: 'यह गलत है। लहसुन सेहत के लिए अच्छा है लेकिन इससे कोरोनवायरस ठीक नहीं होता है। विश्व स्वास्थ्य संगठन ने इसकी पुष्टि की है।',
      explanation_english: 'This is false. While garlic is a healthy food, there is no evidence that eating garlic protects people from the new coronavirus.',
      sources: ['WHO India'],
      safety_note: 'Relying solely on this advice may delay proper medical treatment.'
    };
  }

  const contextStr = dbContext.map(row => `[Source: ${row.source}]: ${row.claim_english}`).join('\n');
  
  const prompt = `You are Aarogya Vaad, a health fact-checking assistant for Indian users. 
You have been given a health claim and context from official Indian health sources.

Claim: ${claim}
Context from verified DB:
${contextStr}

Your task is to return a JSON object with these fields:
{
  "verdict": "SAHI" | "GALAT" | "ADHURA_SACH" | "UNVERIFIED",
  "explanation_hindi": string (2-3 sentences, Class 5 level),
  "explanation_english": string (same),
  "sources": string[],
  "safety_note": string | null
}

NEVER use medical jargon. NEVER diagnose. Return ONLY JSON.`;

  const message = await anthropic.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }]
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  throw new Error("Failed to parse JSON from Claude");
}

export async function normaliseSymptoms(text: string) {
  if (USE_MOCK) {
    if (!triageRules) loadTriageRules();
    const lowerText = text.toLowerCase();
    
    // Dynamic matching algorithm
    let bestMatch: TriageRule | null = null;
    if (triageRules) {
      for (const rule of triageRules) {
        // Does the user input contain any of the keywords from the database?
        const isMatch = rule.keywords.some(k => lowerText.includes(k));
        if (isMatch) {
           // We assign the highest severity hit, just securely falling safe-side triage
           if (!bestMatch || rule.severity > bestMatch.severity) {
              bestMatch = rule;
           }
        }
      }
    }

    if (bestMatch) {
      return {
        symptoms: [{ colloquial_term: text, normalised_term: bestMatch.normalized_term, body_system: bestMatch.body_system }],
        red_flags: bestMatch.red_flags,
        duration_mentioned: "Assessment required",
        severity_score: bestMatch.severity
      };
    }

    // Default fallback
    return {
      symptoms: [{ colloquial_term: text, normalised_term: 'General Malaise', body_system: 'Systemic' }],
      red_flags: [],
      duration_mentioned: null,
      severity_score: 1 // triggers LOW
    };
  }

  const prompt = `You are a triage assistant for rural Indian patients. The user has described symptoms in colloquial language. Extract structured symptom data. Do NOT diagnose.
Output JSON:
{
  "symptoms": [{ "colloquial_term": string, "normalised_term": string, "body_system": string }],
  "red_flags": string[],
  "duration_mentioned": string | null,
  "severity_score": number (1-5)
}

User input: ${text}`;

  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 400,
    messages: [{ role: 'user', content: prompt }]
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  throw new Error("Failed to parse JSON from Claude");
}
