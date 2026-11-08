import { ConflictError, UnauthorizedError } from '../errors/index.js';
import * as usersRepository from '../repositories/users.repository.js';

// A validly signed token whose user no longer exists is treated as an invalid token.
function findUserOrThrow(userId) {
	const user = usersRepository.findById(userId);
	if (!user) {
		throw new UnauthorizedError('TOKEN_INVALID', 'Token is invalid');
	}
	return user;
}

export function getProfile(userId) {
	return findUserOrThrow(userId);
}

// Full replacement of the editable fields. node:sqlite is synchronous, so no other request
// can run between the email check and the update; the UNIQUE constraint remains as a backstop.
export function updateProfile(userId, { firstName, lastName, email, address }) {
	findUserOrThrow(userId);

	if (usersRepository.isEmailUsedByOtherUser(email, userId)) {
		throw new ConflictError('EMAIL_ALREADY_IN_USE', 'Email is already in use');
	}

	return usersRepository.update(userId, { firstName, lastName, email, address });
}
