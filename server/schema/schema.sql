CREATE TABLE abilities (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  value INTEGER,
  duration INTEGER,
  description TEXT,
  cooldown INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE fighters (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  health INTEGER NOT NULL,
  attack INTEGER NOT NULL,
  defense INTEGER NOT NULL,
  ability_id INTEGER,
  CONSTRAINT fighters_ability_fk
    FOREIGN KEY (ability_id)
    REFERENCES abilities(id)
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);