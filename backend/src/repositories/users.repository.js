import { db } from '../db/connection.js';

const findCredentialsByEmailStatement = db.prepare('SELECT id, password_hash FROM users WHERE email = ?');

// Returns the password hash for authentication only; it must never reach a response.
export function findCredentialsByEmail(email) {
	const row = findCredentialsByEmailStatement.get(email);
	if (!row) {
		return null;
	}

	return { id: row.id, passwordHash: row.password_hash };
}
