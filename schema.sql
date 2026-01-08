DROP TABLE IF EXISTS prospects;
DROP TABLE IF EXISTS activities;

CREATE TABLE prospects (
  id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  industry TEXT,
  stage TEXT NOT NULL DEFAULT 'PROSPECT',
  revenue_range TEXT,
  score_composite INTEGER,
  score_details TEXT, -- JSON string
  notes TEXT,
  assigned_to TEXT, -- User ID
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT, -- For MVP auth
  role TEXT DEFAULT 'user',
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE activities (
  id TEXT PRIMARY KEY,
  account_id TEXT, -- Nullable FK to accounts
  contact_id TEXT, -- Nullable FK to contacts
  opportunity_id TEXT, -- Nullable FK to opportunities
  type TEXT NOT NULL, -- call, email, meeting, note
  direction TEXT DEFAULT 'outbound', -- inbound, outbound
  status TEXT DEFAULT 'completed', -- planned, completed
  subject TEXT,
  content TEXT,
  date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(account_id) REFERENCES accounts(id),
  FOREIGN KEY(contact_id) REFERENCES contacts(id),
  FOREIGN KEY(opportunity_id) REFERENCES opportunities(id) 
);

-- Indexes for faster retrieval by entity
CREATE INDEX idx_activities_account ON activities(account_id);
CREATE INDEX idx_activities_contact ON activities(contact_id);
CREATE INDEX idx_activities_opportunity ON activities(opportunity_id);
