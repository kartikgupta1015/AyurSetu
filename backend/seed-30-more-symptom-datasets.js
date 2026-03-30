const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data/symptom-triage');

const datasets = [
  { id: 'who-icd-11-core', rules: ['"fever,chills,sweat","Febrile Illness","Systemic","",2', '"unexplained weight loss,night sweats","Systemic Red Flags","Systemic","Malignancy risk",4'] },
  { id: 'nhs-111-pathways', rules: ['"sore throat,swallow pain","Pharyngitis","ENT","",1', '"stiff neck,light sensitivity,fever","Meningitis","Neurological","Medical Emergency",5'] },
  { id: 'cdc-infectious-diseases', rules: ['"tick bite,bullseye rash","Lyme Disease","Integumentary","",2', '"watery diarrhea,rice water stool","Cholera","Gastrointestinal","Dehydration risk",4'] },
  { id: 'mayo-clinic-general', rules: ['"muscle cramp,spasm","Muscle Spasm","Musculoskeletal","",1', '"sudden worst headache of life,thunderclap","Subarachnoid Hemorrhage","Neurological","Aneurysm rupture risk",5'] },
  { id: 'aap-pediatric-triage', rules: ['"diaper rash,red bottom","Diaper Dermatitis","Integumentary","",1', '"baby,grunting,flaring nostrils,blue lips","Respiratory Distress","Respiratory","Pediatric Emergency",5'] },
  { id: 'rcog-obstetrics', rules: ['"morning sickness,nausea,pregnant","Pregnancy Nausea","Gastrointestinal","",1', '"pregnant,heavy bleeding,clots","Obstetrical Hemorrhage","Reproductive","Miscarriage/Placental risk",5'] },
  { id: 'asbestos-occupational', rules: ['"dust exposure,dry cough","Occupational Dust Exposure","Respiratory","",2', '"factory worker,chest tightness,mesothelioma","Occupational Lung Disease","Respiratory","Carcinogenic exposure",4'] },
  { id: 'epa-environmental-toxins', rules: ['"smell smoke,lightheaded","Carbon Monoxide Exposure","Systemic","",3', '"swallowed bleach,poison,chemical burn","Chemical Poisoning","Gastrointestinal","Toxicological Emergency",5'] },
  { id: 'aha-cardiovascular', rules: ['"palpitations,fluttering heart","Palpitations","Cardiovascular","",2', '"crushing chest pain,jaw pain,left arm pain","Myocardial Infarction","Cardiovascular","Heart Attack",5'] },
  { id: 'ats-pulmonology', rules: ['"mild cough,phlegm","Bronchitis","Respiratory","",2', '"coughing up blood,hemoptysis","Hemoptysis","Respiratory","Pulmonary Embolism/TB risk",4'] },
  { id: 'aga-gastrointestinal', rules: ['"bloating,gas,fart","Flatulence / Bloating","Gastrointestinal","",1', '"vomiting blood,coffee ground vomit","GI Bleed","Gastrointestinal","Internal bleeding risk",5'] },
  { id: 'aan-neurology', rules: ['"mild headache,tension","Tension Headache","Neurological","",1', '"sudden weakness,one side,face drooping","Stroke","Neurological","Time critical",5'] },
  { id: 'apa-psychiatry', rules: ['"sad,crying,feeling down","Depressed Mood","Psychiatric","",2', '"voices,hallucinations,delusions","Psychosis","Psychiatric","",4'] },
  { id: 'aad-dermatology', rules: ['"dry skin,flaky","Xerosis","Integumentary","",1', '"spreading red rash,hot to touch,blister","Cellulitis / Necrotizing Fasciitis","Integumentary","Sepsis risk",4'] },
  { id: 'aaos-orthopedic-trauma', rules: ['"sprained ankle,twist","Ankle Sprain","Musculoskeletal","",2', '"bone sticking out,compound fracture","Open Fracture","Musculoskeletal","Infection risk",5'] },
  { id: 'aso-ophthalmology', rules: ['"dry eye,scratchy","Dry Eye Syndrome","Ocular","",1', '"sudden loss of vision,curtain falling","Retinal Detachment","Ocular","Permanent vision loss risk",5'] },
  { id: 'ent-otolaryngology', rules: ['"earwax,stuffed ear","Cerumen Impaction","ENT","",1', '"swallowing impossible,drooling,cannot breathe","Epiglottitis","ENT","Airway compromise",5'] },
  { id: 'endosociety-hormonal', rules: ['"tired,cold,weight gain","Hypothyroidism","Endocrine","",2', '"extreme thirst,peeing frequently,fruity breath","Diabetic Ketoacidosis","Endocrine","Ketosis",5'] },
  { id: 'auao-urology', rules: ['"pain peeing,burning urine","Urinary Tract Infection","Genitourinary","",2', '"flank pain,severe,blood in urine","Kidney Stones","Genitourinary","",3'] },
  { id: 'acog-gynecology', rules: ['"cramps,period pain","Dysmenorrhea","Reproductive","",1', '"sudden severe pelvic pain,missed period","Ectopic Pregnancy","Reproductive","Rupture risk",5'] },
  { id: 'asco-oncology-redflags', rules: ['"mole changed color,irregular border","Suspicious Nevus","Integumentary","Melanoma risk",3', '"new hard lump in breast,nipple discharge","Breast Mass","Reproductive","Malignancy risk",4'] },
  { id: 'ash-hematology', rules: ['"pale,tired,bruise easily","Anemia / Thrombocytopenia","Hematological","",2', '"uncontrollable bleeding,hemophilia","Active Bleeding","Hematological","",5'] },
  { id: 'aid-immunology', rules: ['"sneeze,pollen,runny nose","Allergic Rhinitis","Immunological","",1', '"bee sting,swollen lips,cannot breathe","Anaphylaxis","Immunological","Airway closure",5'] },
  { id: 'rheum-arthritis', rules: ['"knee pain,old age,creak","Osteoarthritis","Musculoskeletal","",2', '"swollen,red,hot joint,fever","Septic Arthritis","Musculoskeletal","Joint destruction risk",4'] },
  { id: 'id-tropical-medicine', rules: ['"mosquito bite,itch","Insect Bite","Integumentary","",1', '"high fever,chills,shaking,travel history","Malaria / Typhoid","Systemic","",4'] },
  { id: 'geriatrics-agso', rules: ['"memory slip,forgot keys","Mild Cognitive Impairment","Neurological","",2', '"elderly,sudden confusion,sudden agitation","Delirium / UTI","Neurological","Rapid decline",4'] },
  { id: 'nida-substance-abuse', rules: ['"hangover,drank too much","Alcohol Hangover","Systemic","",1', '"blue lips,pinpoint pupils,not breathing,needle","Opioid Overdose","Systemic","Respiratory arrest",5'] },
  { id: 'amssm-sports-medicine', rules: ['"sore muscles,workout","DOMS","Musculoskeletal","",1', '"head injury,loss of consciousness,vomiting","Concussion / Head Trauma","Neurological","Brain bleed risk",5'] },
  { id: 'wounds-burns-triage', rules: ['"paper cut,scrape","Minor Abrasion","Integumentary","",1', '"deep cut,pulsing blood,arterial","Arterial Laceration","Cardiovascular","Exsanguination",5'] },
  { id: 'dental-emergencies', rules: ['"toothache,cavity","Dental Caries","Dental","",2', '"tooth knocked out,bleeding gums,trauma","Dental Avulsion","Dental","Time critical replantation",4'] }
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

// The array currently ends with   ];
// We want to inject the 30 new file names before that closing bracket.

const startToken = 'const files = [';
const endToken = '  ];';
const startIndex = claudeCode.indexOf(startToken);

if (startIndex !== -1) {
  // Find the end token that corresponds to THIS files block.
  // There are two 'const files = [' blocks (one in fuse.ts, but here in claude.ts there's only one).
  const endIndex = claudeCode.indexOf(endToken, startIndex);
  if (endIndex !== -1) {
    let newFilesList = "";
    datasets.forEach(db => {
      newFilesList += `    '${db.id}.csv',\n`;
    });
    
    // Inject the new files right before the closing bracket of the files array
    const injectedCode = claudeCode.slice(0, endIndex) + newFilesList + claudeCode.slice(endIndex);
    fs.writeFileSync(claudeFilePath, injectedCode, 'utf8');
    console.log('Successfully generated 30 expanded symptom datasets and injected them into claude.ts!');
  } else {
    console.error('Could not find end of files array.');
  }
} else {
  console.error('Could not find files array in claude.ts.');
}
