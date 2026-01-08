CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'user', -- 'admin', 'user'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- We cannot easily add a foreign key constraint to an existing table in SQLite/D1 
-- without a complex recreation, so we will just add the column for now.
ALTER TABLE prospects ADD COLUMN assigned_to TEXT;
