-- Mently — Cloudflare D1 Schema
-- Executar: wrangler d1 execute mently-db --remote --file=schema.sql

CREATE TABLE IF NOT EXISTS users (
  id           TEXT PRIMARY KEY,
  email        TEXT UNIQUE NOT NULL,
  name         TEXT,
  google_id    TEXT UNIQUE,
  avatar_url   TEXT,
  created_date TEXT NOT NULL,
  updated_date TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at   TEXT NOT NULL,
  created_date TEXT NOT NULL
);

-- Tabela genérica para todas as entidades de saúde
-- Tipos: profile, labResult, weight, nutrition, sleep, exercise
CREATE TABLE IF NOT EXISTS entities (
  id           TEXT PRIMARY KEY,
  type         TEXT NOT NULL,
  data         TEXT NOT NULL,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_date TEXT NOT NULL,
  updated_date TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_entities_type_user ON entities(type, user_id);
CREATE INDEX IF NOT EXISTS idx_entities_user ON entities(user_id);
