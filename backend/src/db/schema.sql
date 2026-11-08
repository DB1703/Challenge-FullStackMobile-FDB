CREATE TABLE IF NOT EXISTS users (
	id INTEGER PRIMARY KEY,
	email TEXT NOT NULL UNIQUE,
	password_hash TEXT NOT NULL,
	first_name TEXT NOT NULL,
	last_name TEXT NOT NULL,
	birth_date TEXT NOT NULL,           -- ISO 8601: 'YYYY-MM-DD'
	address TEXT                        -- optional; empty is stored as NULL
);

CREATE TABLE IF NOT EXISTS venues (
	id INTEGER PRIMARY KEY,
	name TEXT NOT NULL,
	address TEXT NOT NULL,
	location TEXT NOT NULL,             -- free-text reference
	description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS venue_opening_hours (
	venue_id INTEGER NOT NULL REFERENCES venues(id),
	weekday INTEGER NOT NULL,           -- ISO 8601: 1 = Monday, 7 = Sunday
	opens_at TEXT NOT NULL,             -- 'HH:MM'
	closes_at TEXT NOT NULL,            -- 'HH:MM'
	PRIMARY KEY (venue_id, weekday)
);

CREATE TABLE IF NOT EXISTS activities (
	id INTEGER PRIMARY KEY,
	venue_id INTEGER NOT NULL REFERENCES venues(id),
	name TEXT NOT NULL,
	description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
	id INTEGER PRIMARY KEY,
	activity_id INTEGER NOT NULL REFERENCES activities(id),
	weekday INTEGER NOT NULL,           -- ISO 8601: 1 = Monday, 7 = Sunday
	start_time TEXT NOT NULL,           -- 'HH:MM'
	end_time TEXT NOT NULL,             -- 'HH:MM'
	UNIQUE (activity_id, weekday, start_time)
);
