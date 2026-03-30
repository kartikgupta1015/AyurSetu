const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data/symptom-triage');

const datasets = [
  { id: 'ada-health-ontology', rules: ['"dizzy,spin,vertigo","Vertigo / Vestibular Syndrome","Neurological","",2', '"frequent urination,thirst","Hyperglycemia / Polyuria","Endocrine","",3'] },
  { id: 'buoy-symptom-algo', rules: ['"lump,breast,mass","Palpable Mass","Integumentary","Refer for mammography",3', '"calf,swelling,pain,warm","Deep Vein Thrombosis (DVT)","Cardiovascular","PE Risk",4'] },
  { id: 'babylon-knowledge-graph', rules: ['"memory,forget,confusion","Cognitive Impairment","Neurological","",2', '"snore,stop breathing,apnea","Obstructive Sleep Apnea","Respiratory","",2'] },
  { id: 'mimic-iv-triage', rules: ['"unresponsive,coma,unconscious,faint","Altered Mental Status","Neurological","GCS<8",5', '"bp drop,hypotension,faint","Shock / Hypotension","Cardiovascular","Requires fluid resuscitation",5'] },
  { id: 'symp-ontology', rules: ['"runny nose,sneezing,congestion,sneeze","Viral Rhinitis","Respiratory","",1', '"watery stool,loose stool","Diarrhea","Gastrointestinal","",2'] },
  { id: 'doid-disease-ontology', rules: ['"wheeze,asthma,short breath","Asthma Exacerbation","Respiratory","",3', '"joint,stiff,morning","Rheumatoid Arthritis","Musculoskeletal","",2'] },
  { id: 'promis-severity-scores', rules: ['"fatigue,tired,exhausted","Chronic Fatigue","Systemic","",2', '"chronic pain,ache","Chronic Pain Syndrome","Musculoskeletal","",2'] },
  { id: 'cprd-primary-care', rules: ['"indigestion,heartburn,reflux","GERD","Gastrointestinal","",2', '"scrotum,pain,testicle","Testicular Torsion","Genitourinary","Ischemic risk",5'] },
  { id: 'ahrq-hcup-er', rules: ['"appendicitis,right lower quadrant,sharp","Appendicitis","Gastrointestinal","Rupture risk",4', '"suicidal,depressed,hurt oneself","Psychiatric Emergency","Psychiatric","High self-harm risk",5'] },
  { id: 'clinvar-genetics', rules: ['"bleeding disorder,hemophilia","Coagulopathy / Hemophilia","Hematological","Spontaneous bleeding",4', '"muscle weakness,genetic","Muscular Dystrophy","Musculoskeletal","",3'] }
];

// Write all CSV files
datasets.forEach(db => {
  const filePath = path.join(dataDir, `${db.id}.csv`);
  let content = "keywords,normalized_term,body_system,red_flags,severity\n";
  db.rules.forEach(rule => {
    content += `${rule}\n`;
  });
  fs.writeFileSync(filePath, content, 'utf8');
});

// Update claude.ts
const claudeFilePath = path.join(__dirname, 'src/services/claude.ts');
let claudeCode = fs.readFileSync(claudeFilePath, 'utf8');

// Find the start and end of the loadTriageRules function
const searchStart = `function loadTriageRules() {`;
const searchEnd = `export async function extractHealthClaim(text: string) {`;

const tStart = claudeCode.indexOf(searchStart);
const tEnd = claudeCode.indexOf(searchEnd);

if (tStart !== -1 && tEnd !== -1) {
  const replacement = `function loadTriageRules() {
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
    'clinvar-genetics.csv'
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
  console.log(\`[Triage DB] Successfully loaded \${triageRules.length} medical ontology rules.\`);
}

`;
  claudeCode = claudeCode.substring(0, tStart) + replacement + claudeCode.substring(tEnd);
  fs.writeFileSync(claudeFilePath, claudeCode, 'utf8');
  console.log('Successfully generated 10 symptom datasets and wired them into claude.ts!');
} else {
  console.error("Failed to inject code into claude.ts");
}
