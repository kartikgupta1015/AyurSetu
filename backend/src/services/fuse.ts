import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import Fuse from 'fuse.js';

export interface ClaimData {
  claim_english: string;
  claim_type: string;
  source: string;
}

let fuseIndex: Fuse<ClaimData> | null = null;

export function initFuse() {
  if (fuseIndex) return;

  const dataDir = path.join(process.cwd(), '../data/verified-claims');
  const files = [
    { file: 'who-india.csv', source: 'WHO India' },
    { file: 'mohfw-fact-checks.csv', source: 'MoHFW' },
    { file: 'icmr-advisories.csv', source: 'ICMR' },
    { file: 'general-health-myths.csv', source: 'Medical Myth Directory' },
    { file: 'pib-fact-checks.csv', source: 'PIB Fact Check' },
    { file: 'alt-news-health.csv', source: 'Alt News Science' },
    { file: 'ayush-advisories.csv', source: 'Ministry of AYUSH' },
    { file: 'fssai-myths.csv', source: 'FSSAI' },
    { file: 'ncg-cancer-myths.csv', source: 'National Cancer Grid India' },
    { file: 'unicef-maternal-myths.csv', source: 'UNICEF India' },
    { file: 'nvbdcp-vector-myths.csv', source: 'NVBDCP' },
    { file: 'cdc-global-myths.csv', source: 'CDC' },
    { file: 'mayo-webmd-myths.csv', source: 'Mayo Clinic / WebMD' },
    { file: 'fda-dietary-hoaxes.csv', source: 'FDA' },
    { file: 'nin-icmr-diet.csv', source: 'NIN / ICMR' },
    { file: 'fogsi-womens-health.csv', source: 'FOGSI' },
    { file: 'ips-mental-health.csv', source: 'Indian Psychiatric Society' },
    { file: 'iadvl-skincare-myths.csv', source: 'IADVL' },
    { file: 'notto-organ-donation.csv', source: 'NOTTO' },
    { file: 'who-traditional-medicine.csv', source: 'WHO Traditional Medicine' },
    { file: 'aha-cardiac-myths.csv', source: 'American Heart Association' },
    { file: 'red-cross-blood.csv', source: 'Red Cross' },
    { file: 'gpei-polio-rumors.csv', source: 'GPEI' },
    { file: 'ida-dental-myths.csv', source: 'Indian Dental Association' },
    { file: 'iap-pediatrics.csv', source: 'IAP' },
    { file: 'aap-child-safety.csv', source: 'AAP' },
    { file: 'bpni-breastfeeding.csv', source: 'BPNI' },
    { file: 'esi-endocrinology.csv', source: 'ESI' },
    { file: 'rssdi-diabetes.csv', source: 'RSSDI' },
    { file: 'tai-tuberculosis.csv', source: 'TAI' },
    { file: 'api-internal-medicine.csv', source: 'API' },
    { file: 'isg-gastroenterology.csv', source: 'ISG' },
    { file: 'usi-urology.csv', source: 'USI' },
    { file: 'nimhans-mental-health.csv', source: 'NIMHANS' },
    { file: 'nsi-neurology.csv', source: 'NSI' },
    { file: 'ardsi-dementia.csv', source: 'ARDSI' },
    { file: 'wpa-psychiatry.csv', source: 'WPA' },
    { file: 'ioa-orthopaedics.csv', source: 'IOA' },
    { file: 'aios-ophthalmology.csv', source: 'AIOS' },
    { file: 'ira-rheumatology.csv', source: 'IRA' },
    { file: 'cdsco-pharmacology.csv', source: 'CDSCO' },
    { file: 'pcimh-ayurveda.csv', source: 'PCIM&H' },
    { file: 'iscr-clinical-trials.csv', source: 'ISCR' },
    { file: 'naco-aids.csv', source: 'NACO' },
    { file: 'nbtc-blood-transfusion.csv', source: 'NBTC' },
    { file: 'iapsm-public-health.csv', source: 'IAPSM' },
    { file: 'fao-agriculture.csv', source: 'FAO' },
    { file: 'fiapo-animal-protection.csv', source: 'FIAPO' },
    { file: 'nha-digital-health.csv', source: 'NHA ABDM' },
    { file: 'sir-radiography.csv', source: 'SIR' },
    { file: 'srs-sleep-research.csv', source: 'SRS' },
    { file: 'ima-quackery.csv', source: 'IMA' },
    { file: 'nin-nutrition.csv', source: 'NIN India' },
    { file: 'whf-cardiology.csv', source: 'WHF' }
  ];

  const allClaims: ClaimData[] = [];

  for (const { file, source } of files) {
    const filePath = path.join(dataDir, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const records = parse(content, { skip_empty_lines: true });
      for (let i = 1; i < records.length; i++) { // Skip header
        const row = records[i];
        if (row.length >= 2) {
          allClaims.push({
            claim_english: row[0],
            claim_type: row[1],
            source: source
          });
        }
      }
    } else {
      console.warn(`[Fuse] Warning: Data file missing: ${filePath}`);
    }
  }

  // Initialize Fuse.js with a generous fuzzy matching threshold
  fuseIndex = new Fuse(allClaims, {
    keys: ['claim_english'],
    threshold: 0.6, // Higher threshold allows "garlic cures covid" to match "Garlic protects against infection..."
    includeScore: true,
    ignoreLocation: true // Search anywhere in the string
  });
  
  console.log(`[Fuse] Loaded ${allClaims.length} records into memory for fuzzy searching.`);
}

export function searchClaim(query: string) {
  if (!fuseIndex) initFuse();
  const results = fuseIndex!.search(query);
  return results.length > 0 && results[0].score! < 0.6 ? results[0] : null;
}
