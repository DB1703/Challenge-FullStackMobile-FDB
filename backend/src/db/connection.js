import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

// Paths are resolved from this file so the database is the same regardless of the working directory.
const dataDir = join(import.meta.dirname, '../../data');
const dbPath = join(dataDir, 'app.db');
const schemaPath = join(import.meta.dirname, 'schema.sql');

mkdirSync(dataDir, { recursive: true });

export const db = new DatabaseSync(dbPath);

// SQLite does not enforce foreign keys unless they are enabled on each connection.
db.exec('PRAGMA foreign_keys = ON');

export function applySchema() {
	db.exec(readFileSync(schemaPath, 'utf8'));
}

// The app is unusable without users or venues, so missing either counts as empty.
export function isDatabaseEmpty() {
	const { hasUsers, hasVenues } = db
		.prepare(`
			SELECT
				EXISTS (SELECT 1 FROM users) AS hasUsers,
				EXISTS (SELECT 1 FROM venues) AS hasVenues
		`)
		.get();

	return !hasUsers || !hasVenues;
}
