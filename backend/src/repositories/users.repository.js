import { db } from '../db/connection.js';

// Public columns: password_hash is deliberately excluded.
const USER_COLUMNS = 'id, email, first_name, last_name, birth_date, address';

const findCredentialsByEmailStatement = db.prepare('SELECT id, password_hash FROM users WHERE email = ?');
const findByIdStatement = db.prepare(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?`);
const isEmailUsedByOtherUserStatement = db.prepare(
	'SELECT EXISTS (SELECT 1 FROM users WHERE email = ? AND id <> ?) AS used',
);
const updateStatement = db.prepare(`
	UPDATE users
	SET first_name = ?, last_name = ?, email = ?, address = ?
	WHERE id = ?
	RETURNING ${USER_COLUMNS}
`);

function toUser(row) {
	if (!row) {
		return null;
	}

	return {
		id: row.id,
		email: row.email,
		firstName: row.first_name,
		lastName: row.last_name,
		birthDate: row.birth_date,
		address: row.address,
	};
}

// Returns the password hash for authentication only; it must never reach a response.
export function findCredentialsByEmail(email) {
	const row = findCredentialsByEmailStatement.get(email);
	if (!row) {
		return null;
	}

	return { id: row.id, passwordHash: row.password_hash };
}

export function findById(id) {
	return toUser(findByIdStatement.get(id));
}

export function isEmailUsedByOtherUser(email, userId) {
	return isEmailUsedByOtherUserStatement.get(email, userId).used === 1;
}

export function update(id, { firstName, lastName, email, address }) {
	return toUser(updateStatement.get(firstName, lastName, email, address, id));
}
