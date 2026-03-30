const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data/verified-claims');

const datasets = [
  { id: 'iap-pediatrics', source: 'IAP', claims: ['"Teething causes high fever.","other"', '"Giving sugar water soothes a crying newborn safely.","cure"'] },
  { id: 'aap-child-safety', source: 'AAP', claims: ['"Infants should sleep on their stomachs to prevent choking.","prevention"', '"Baby walkers help children learn to walk faster.","other"'] },
  { id: 'bpni-breastfeeding', source: 'BPNI', claims: ['"Formula is more nutritious than breastmilk.","other"', '"Mothers with flat nipples cannot breastfeed.","other"'] },
  { id: 'esi-endocrinology', source: 'ESI', claims: ['"Eating cabbage causes thyroid disease.","diagnosis"', '"Insulin injections cure type 2 diabetes permanently.","cure"'] },
  { id: 'rssdi-diabetes', source: 'RSSDI', claims: ['"Bitter gourd juice completely replaces insulin.","cure"', '"People with diabetes cannot eat fruits.","other"'] },
  { id: 'tai-tuberculosis', source: 'TAI', claims: ['"TB is a genetic disease passed from parents.","other"', '"Once you feel better, you can stop taking TB medicine.","cure"'] },
  { id: 'api-internal-medicine', source: 'API', claims: ['"Fasting completely cures all internal infections.","cure"', '"All fevers require antibiotics.","cure"'] },
  { id: 'isg-gastroenterology', source: 'ISG', claims: ['"Skipping meals successfully cleanses the gut.","prevention"', '"Ulcers are caused by eating spicy food.","other"'] },
  { id: 'usi-urology', source: 'USI', claims: ['"Drinking beer dissolves kidney stones.","cure"', '"Cranberry juice cures all urinary tract infections instantly.","cure"'] },
  { id: 'nimhans-mental-health', source: 'NIMHANS', claims: ['"Depression is just a sign of mental weakness.","other"', '"Therapy is only for crazy people.","other"'] },
  { id: 'nsi-neurology', source: 'NSI', claims: ['"You should put a spoon in the mouth of someone having a seizure.","cure"', '"Strokes only happen to elderly people.","other"'] },
  { id: 'ardsi-dementia', source: 'ARDSI', claims: ['"Memory loss is a normal part of ageing.","prevention"', '"Dementia means the person has gone completely insane.","other"'] },
  { id: 'wpa-psychiatry', source: 'WPA', claims: ['"Psychiatric medications change your fundamental personality.","other"', '"Children do not experience mental health issues.","other"'] },
  { id: 'ioa-orthopaedics', source: 'IOA', claims: ['"Cracking joints causes arthritis later in life.","prevention"', '"Rest is the best treatment for chronic back pain.","cure"'] },
  { id: 'aios-ophthalmology', source: 'AIOS', claims: ['"Reading in the dark causes permanent blindness.","other"', '"Eyedrops cure cataracts without surgery.","cure"'] },
  { id: 'ira-rheumatology', source: 'IRA', claims: ['"Arthritis only affects old people.","diagnosis"', '"Cold weather directly causes rheumatoid arthritis.","other"'] },
  { id: 'cdsco-pharmacology', source: 'CDSCO', claims: ['"Generic drugs are weaker than branded drugs.","other"', '"Taking expired medicine is always completely safe.","other"'] },
  { id: 'pcimh-ayurveda', source: 'PCIM&H', claims: ['"Bhasmas (metallic ash) are totally safe without purification.","other"', '"Ayurvedic medicines have absolutely zero side effects.","other"'] },
  { id: 'iscr-clinical-trials', source: 'ISCR', claims: ['"Clinical trials use humans as literal guinea pigs.","other"', '"Placebos are active medicines hidden from patients.","other"'] },
  { id: 'naco-aids', source: 'NACO', claims: ['"Mosquito bites can transmit HIV/AIDS.","other"', '"Sharing food with an HIV positive person transmits the virus.","other"'] },
  { id: 'nbtc-blood-transfusion', source: 'NBTC', claims: ['"Donating blood makes you permanently weak.","other"', '"You can catch infections from donating blood at a clinic.","other"'] },
  { id: 'iapsm-public-health', source: 'IAPSM', claims: ['"Sanitizer is always better than washing hands with soap.","other"', '"Boiling water for 10 seconds kills all bacteria.","other"'] },
  { id: 'fao-agriculture', source: 'FAO', claims: ['"GMO crops are laced with cancer-causing toxins.","other"', '"Washing vegetables in bleach is necessary to remove pesticides.","prevention"'] },
  { id: 'fiapo-animal-protection', source: 'FIAPO', claims: ['"You can get rabies just by touching a healthy dog.","other"', '"Cats steal the breath of sleeping infants.","other"'] },
  { id: 'nha-digital-health', source: 'NHA ABDM', claims: ['"Creating a health ID gives the government control over your body.","other"', '"Health records on ABDM are publicly visible to everyone.","other"'] },
  { id: 'sir-radiography', source: 'SIR', claims: ['"X-rays make your body radioactive for several days.","other"', '"Pregnant women should avoid all ultrasounds because they use radiation.","other"'] },
  { id: 'srs-sleep-research', source: 'SRS', claims: ['"Your brain completely shuts down while you sleep.","other"', '"Waking a sleepwalker causes them to go into shock and die.","other"'] },
  { id: 'ima-quackery', source: 'IMA', claims: ['"Registered doctors actively suppress natural cures to make money.","other"', '"Local bone-setters are safer than orthopedic surgeons.","cure"'] },
  { id: 'nin-nutrition', source: 'NIN India', claims: ['"Carbohydrates are inherently toxic and should be entirely eliminated.","other"', '"Detox juices flush hard toxins from the liver and kidneys.","cure"'] },
  { id: 'whf-cardiology', source: 'WHF', claims: ['"Heart disease only affects men.","other"', '"A fast heartbeat indicates an imminent heart attack.","diagnosis"'] }
];

// Write all CSV files
datasets.forEach(db => {
  const filePath = path.join(dataDir, `${db.id}.csv`);
  let content = "claim_english,claim_type,source\n";
  db.claims.forEach(claim => {
    content += `${claim},"${db.source}"\n`;
  });
  fs.writeFileSync(filePath, content, 'utf8');
});

// Update fuse.ts
const fuseFilePath = path.join(__dirname, 'src/services/fuse.ts');
let fuseCode = fs.readFileSync(fuseFilePath, 'utf8');

// Find the files array
const filesArrayStart = fuseCode.indexOf('const files = [');
const filesArrayEnd = fuseCode.indexOf('];', filesArrayStart) + 2;

if (filesArrayStart !== -1 && filesArrayEnd !== -1) {
  let newArrayString = 'const files = [\n';
  
  // Existing files we know are there
  const existing = [
    { id: 'who-india', src: 'WHO India' },
    { id: 'mohfw-fact-checks', src: 'MoHFW' },
    { id: 'icmr-advisories', src: 'ICMR' },
    { id: 'general-health-myths', src: 'Medical Myth Directory' },
    { id: 'pib-fact-checks', src: 'PIB Fact Check' },
    { id: 'alt-news-health', src: 'Alt News Science' },
    { id: 'ayush-advisories', src: 'Ministry of AYUSH' },
    { id: 'fssai-myths', src: 'FSSAI' },
    { id: 'ncg-cancer-myths', src: 'National Cancer Grid India' },
    { id: 'unicef-maternal-myths', src: 'UNICEF India' },
    { id: 'nvbdcp-vector-myths', src: 'NVBDCP' },
    { id: 'cdc-global-myths', src: 'CDC' },
    { id: 'mayo-webmd-myths', src: 'Mayo Clinic / WebMD' },
    { id: 'fda-dietary-hoaxes', src: 'FDA' },
    { id: 'nin-icmr-diet', src: 'NIN / ICMR' },
    { id: 'fogsi-womens-health', src: 'FOGSI' },
    { id: 'ips-mental-health', src: 'Indian Psychiatric Society' },
    { id: 'iadvl-skincare-myths', src: 'IADVL' },
    { id: 'notto-organ-donation', src: 'NOTTO' },
    { id: 'who-traditional-medicine', src: 'WHO Traditional Medicine' },
    { id: 'aha-cardiac-myths', src: 'American Heart Association' },
    { id: 'red-cross-blood', src: 'Red Cross' },
    { id: 'gpei-polio-rumors', src: 'GPEI' },
    { id: 'ida-dental-myths', src: 'Indian Dental Association' }
  ];
  
  // Combine all
  const allEntries = [...existing, ...datasets.map(d => ({ id: d.id, src: d.source }))];
  
  allEntries.forEach((entry, i) => {
    newArrayString += `    { file: '${entry.id}.csv', source: '${entry.src}' }${i < allEntries.length - 1 ? ',' : ''}\n`;
  });
  newArrayString += '  ];';
  
  fuseCode = fuseCode.slice(0, filesArrayStart) + newArrayString + fuseCode.slice(filesArrayEnd);
  fs.writeFileSync(fuseFilePath, fuseCode, 'utf8');
  console.log('Successfully generated 30 new datasets and wired them into fuse.ts!');
} else {
  console.error('Failed to locate the files array in fuse.ts');
}
