import { Pool } from 'pg';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/aarogya_vaad',
});

// Using OpenAI for text embeddings (text-embedding-3-small)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'mock-key',
});

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY not found. Using mock fallback embedding.');
    // Return a random 1536-dimensional vector
    return Array.from({ length: 1536 }, () => Math.random() - 0.5);
  }

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  return response.data[0].embedding;
}

export async function querySimilarClaims(embedding: number[], threshold: number = 0.82) {
  try {
    const formattedEmbedding = '[' + embedding.join(',') + ']';
    // Use cosine similarity (<=>) with pgvector
    const query = `
      SELECT id, claim_english, claim_type, source, 1 - (embedding <=> $1::vector) as similarity
      FROM verified_claims
      WHERE 1 - (embedding <=> $1::vector) > $2
      ORDER BY similarity DESC
      LIMIT 3
    `;
    const result = await pool.query(query, [formattedEmbedding, threshold]);
    return result.rows;
  } catch (err) {
    console.error('Vector Search Error:', err);
    return [];
  }
}

export async function insertClaim(claim_english: string, claim_type: string, source: string, embedding: number[]) {
  const formattedEmbedding = '[' + embedding.join(',') + ']';
  const query = `
    INSERT INTO verified_claims (claim_english, claim_type, source, embedding)
    VALUES ($1, $2, $3, $4::vector)
  `;
  await pool.query(query, [claim_english, claim_type, source, formattedEmbedding]);
}

export async function logSymptomCluster(pincode: string, symptom_category: string, severity: string) {
  try {
    const query = `
      INSERT INTO symptom_logs (pincode, symptom_category, severity)
      VALUES ($1, $2, $3)
    `;
    await pool.query(query, [pincode, symptom_category, severity]);

    // Check count for last 72 hours
    const countQuery = `
      SELECT COUNT(*) as recent_count 
      FROM symptom_logs 
      WHERE pincode = $1 
      AND symptom_category = $2
      AND reported_at >= NOW() - INTERVAL '72 hours'
    `;
    const countResult = await pool.query(countQuery, [pincode, symptom_category]);
    return parseInt(countResult.rows[0].recent_count);
  } catch (err) {
    console.error('Error logging symptom:', err);
    return 0; // fallback count
  }
}

export async function checkAshaWorker(pincode: string) {
  try {
    const query = `SELECT * FROM asha_workers WHERE assigned_pincode = $1 LIMIT 1`;
    const result = await pool.query(query, [pincode]);
    return result.rows[0];
  } catch (err) {
    console.error('ASHA Worker lookup failed', err);
    return null;
  }
}
