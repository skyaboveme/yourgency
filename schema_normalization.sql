-- Protocol 1.5: Data Normalization Schema
-- This script upgrades the database from a flat "Prospects" model to a relational "Accounts/Contacts/Opportunities" model.

-- 1. Accounts (Companies)
CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    industry TEXT,
    website TEXT,
    revenue_range TEXT,
    tech_stack TEXT, -- JSON array of detected technologies
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Contacts (People)
CREATE TABLE IF NOT EXISTS contacts (
    id TEXT PRIMARY KEY,
    account_id TEXT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    role TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(account_id) REFERENCES accounts(id)
);

-- 3. Opportunities (Deals)
CREATE TABLE IF NOT EXISTS opportunities (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    primary_contact_id TEXT,
    name TEXT NOT NULL, -- e.g. "Q1 Software License"
    stage TEXT NOT NULL DEFAULT 'New', -- New, Contacted, Discovery, Proposal, Negotiation, Closed Won, Closed Lost
    value REAL, -- Monetary value
    close_date DATE,
    probability INTEGER, -- 0-100
    notes TEXT,
    assigned_to TEXT, -- User ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(account_id) REFERENCES accounts(id),
    FOREIGN KEY(primary_contact_id) REFERENCES contacts(id)
);

-- Note: We are keeping the 'prospects' table for now to allow data migration,
-- but the application should start reading/writing to these new tables.
