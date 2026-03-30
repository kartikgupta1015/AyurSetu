# API Specification

## 1. POST `/api/myth-check`
Checks a WhatsApp forward against verified health datasets.

**Request:**
```json
{
  "text": "Raw garlic cures coronavirus",
  "language": "hi"
}
```

**Response:**
```json
{
  "verdict": "GALAT",
  "explanation_hindi": "...",
  "explanation_english": "...",
  "sources": ["WHO India"],
  "confidence_score": 0.95,
  "card_url": "https://...",
  "safety_note": "..."
}
```

## 2. POST `/api/symptom-check`
Assesses symptoms via NLP and recommends next actions.

**Request:**
```json
{
  "text": "mujhe do din se bukhar hai aur chakkar aa rahe hain",
  "pincode": "221005",
  "language": "hi"
}
```

**Response:**
```json
{
  "severity": "MEDIUM",
  "action_text": "2-3 दिन में डॉक्टर को दिखाएं",
  "symptoms_extracted": [
    {
      "colloquial_term": "bukhar",
      "normalised_term": "Pyrexia",
      "body_system": "General"
    }
  ],
  "requires_facility": true
}
```

## 3. GET `/api/facility-lookup`
Queries nearby facilities matching ABDM IDs.

**Request params:** `?pincode=221005&complaint_category=General`

**Response:**
```json
{
  "facilities": [
    {
      "name": "District Hospital",
      "distance_km": 1.2,
      "accepts_pmjay": true,
      "esanjeevani_available": true,
      "opd_hours": "9 AM - 4 PM"
    }
  ],
  "pincode_searched": "221005"
}
```

## 4. POST `/api/cluster-report`
Logs symptoms into the cluster surveillance DB.

**Request:**
```json
{
  "symptom_category": "Pyrexia",
  "pincode": "221005"
}
```

**Response:**
```json
{
  "logged": true,
  "current_cluster_count": 12,
  "alert_triggered": true,
  "asha_notified": true
}
```
