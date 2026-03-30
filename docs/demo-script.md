# Aarogya Vaad — 3-Minute Demo Script
**Event:** Codecure @ SPIRIT 2026, IIT (BHU) Varanasi

## 0:00 - 0:30 | The Problem & The Hook
*(Screen showing a typical WhatsApp forward about a fake COVID cure)*
**Speaker:**
"Good afternoon, judges. Look at this WhatsApp forward. Over 60% of health messages in India contain false claims like this. But if you’re a user in rural Bihar, reading this in Bhojpuri, you have zero tools to verify it. Practo is in English. WebMD is in English. We built *Aarogya Vaad* — the first Vernacular Health Intelligence Platform designed specifically for the next 50 crore Indians."

## 0:30 - 1:30 | Feature 1: Myth Buster & Symptom Checker (Live Demo)
*(Show Mobile App UI — Simple "Record" and "Paste" interface)*
**Speaker:**
"Our design philosophy is 'Doordarshan simplicity'. No complex navigation.
Watch what happens when I paste that fake WhatsApp forward."
*(Action: Paste Hindi claim -> App returns massive 'GALAT' red card)*
**Speaker:**
"Using Claude 3.5 Sonnet processing locally verified data from the Ministry of Health, it understands the claim natively in Hindi and generates a shareable counter-forward card. 

Next, symptom checking. Let's record audio in Hindi."
*(Action: Tap microphone, say 'Mera sar ghum raha hai aur pet mein dard hai')*
**Speaker:**
"Using Sarvam AI's ASR, it understands colloquial terms perfectly. It maps 'sar ghum raha hai' to Clinical Vertigo. It flags the severity and instantly proxies the NHA ABDM registry to find the nearest AB-PMJAY empanelled hospital or eSanjeevani node."

## 1:30 - 2:30 | Feature 2: The ASHA Cluster Layer (The USP)
*(Switch to Desktop UI / ASHA Dashboard Mockup)*
**Speaker:**
"Every health app struggles with trust and scale. So we built Aarogya Vaad on top of India's existing trust layer: the ASHA workers. 

When users log symptoms, we aggregate them by Pincode. If 10 people in a 72-hour window report fever and rash in Gorakhpur, our backend triggers an SMS to the local ASHA worker via this dashboard. She validates the cluster. 

We aren't just building an app. We are building an active disease surveillance network for the government."

## 2:30 - 3:00 | Tech Stack & Outro
**Speaker:**
"Our stack is production-ready. Fastify backend, Claude 3.5 Sonnet for intelligent extraction, AI4Bharat for translation, and `pgvector` for cheap, fast claim matching. We chose Sarvam AI over Whisper because it's objectively better for Indic languages.
Aarogya Vaad: Built for Bharat, by Bharat. Thank you."
