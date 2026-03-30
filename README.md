# Aarogya Vaad — Vernacular Health Intelligence Platform

This is the repository for the **Codecure @ SPIRIT 2026, IIT (BHU) Varanasi** hackathon submission.

## Section 1 — Problem Statement

India faces three simultaneous health crises that existing apps ignore:

1. **MISINFORMATION EPIDEMIC:** Over 60% of health-related WhatsApp forwards in India contain false or dangerous medical claims (IIPH study, 2022). These circulate primarily in regional languages — completely invisible to English-language fact-checkers.
2. **VERNACULAR BARRIER:** 78% of Indians are not English-proficient. Major telemedicine apps assume English literacy. Rural users cannot articulate symptoms or read results.
3. **SCHEME BLINDNESS:** Over 50 crore Indians are entitled to free treatment under AB-PMJAY but don't know what they're entitled to or how to access eSanjeevani. Entitlement dies unused.

**Aarogya Vaad** addresses all three with one vernacular-first interface.

## Section 2 — Core Features

1. **WHATSAPP MYTH BUSTER:** Extracts health claims from forwards via LLM, compares against WHO India / MoHFW / ICMR verified datasets using `pgvector` RAG, and returns a verified contextual verdict in the user's native language.
2. **VERNACULAR SYMPTOM CHECKER:** Parses colloquial symptoms (e.g. "pet mein gas") using NLP to normalize them into strict ICD-10 equivalents without diagnosing.
3. **NEAREST FACILITY FINDER + SCHEME BRIDGE:** On severe triages, references the public NHA ABDM API to recommend nearby eSanjeevani and AB-PMJAY empanelled hospitals.
4. **GRAM SABHA HEALTH PULSE:** Tracks cluster patterns. If multiple patients report similar symptoms within 72 hrs inside a pin-code, ASHA workers are flagged automatically.

## Section 3 — Tech Stack

*   **Frontend (Mobile):** React Native (Expo) + NativeWind
*   **Frontend (Web):** Next.js 15 App Router + TailwindCSS v4
*   **Backend:** Node.js 20 + Fastify, heavily using `@anthropic-ai/sdk` (Claude)
*   **Data & ML layer:** Supabase (PostgreSQL with `pgvector`), `text-embedding-3-small` (RAG extraction)
*   **Translation & Audio:** AI4Bharat IndicTrans2, Sarvam AI Saarika ASR

## Section 7 — USP Differentiation

vs **Practo / 1mg**: We focus strictly on vernacular simplicity and free scheme bridging, rather than doctor marketplace models.
vs **Google Health**: We incorporate a community surveillance layer driven by ASHA workers, making this a true public health contribution platform.

## Run Instructions

1. `npm install` in the root folder.
2. `npm run dev:backend` to start the Fastify server on `localhost:3001`.
3. `npm run dev:mobile` to start Expo for the React Native mobile app.
4. Open another terminal in `apps/web` and `npm run dev` to start the Next.js web application on `localhost:3000`.
# AyurSetu
