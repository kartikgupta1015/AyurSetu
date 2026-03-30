import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { generateEmbedding, insertClaim } from '../services/pgvector';
import dotenv from 'dotenv';

dotenv.config();

const dataDir = path.join(__dirname, '../../../../data/verified-claims');

async function seedDatabase() {
  console.log('Starting DB seeding process...');

  const verifiedFiles = [
    { file: 'who-india.csv', source: 'WHO India' },
    { file: 'mohfw-fact-checks.csv', source: 'MoHFW' },
    { file: 'icmr-advisories.csv', source: 'ICMR' }
  ];

  for (const { file, source } of verifiedFiles) {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      continue;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const records: string[][] = parse(fileContent, { skip_empty_lines: true });

    for (let i = 1; i < records.length; i++) { // Skip header row
      const row = records[i];
      if (row.length < 2) continue;

      const claim_english = row[0];
      const claim_type = row[1];

      try {
        console.log(`Generating embedding for: "${claim_english}"...`);
        const embedding = await generateEmbedding(claim_english);
        await insertClaim(claim_english, claim_type, source, embedding);
        console.log(`Successfully inserted claim with embedding.\n`);
      } catch (err) {
        console.error(`Error processing row: ${claim_english}`, err);
      }
    }
  }

  console.log('Finished seeding DB.');
  process.exit(0);
}

seedDatabase().catch((err) => {
  console.error('Fatal error during seeding:', err);
  process.exit(1);
});
