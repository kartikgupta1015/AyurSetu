-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Table for verified health claims
CREATE TABLE IF NOT EXISTS verified_claims (
    id SERIAL PRIMARY KEY,
    claim_english TEXT NOT NULL,
    claim_type VARCHAR(50) NOT NULL,
    source VARCHAR(100) NOT NULL,
    embedding vector(1536) -- Using 1536 dimensions for text-embedding-3-small fallback approximation, or adjust if using Claude. 
);

-- Table for tracking symptom clusters (for ASHA workers)
CREATE TABLE IF NOT EXISTS symptom_logs (
    id SERIAL PRIMARY KEY,
    pincode VARCHAR(10) NOT NULL,
    symptom_category VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for ASHA workers
CREATE TABLE IF NOT EXISTS asha_workers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    assigned_pincode VARCHAR(10) NOT NULL
);

-- Insert dummy ASHA worker for hackathon
INSERT INTO asha_workers (name, phone_number, assigned_pincode) 
VALUES ('Geeta Devi', '+919999999999', '221005') 
ON CONFLICT (phone_number) DO NOTHING;
