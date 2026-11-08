import { UnauthorizedError } from '../errors/index.js';
import * as usersRepository from '../repositories/users.repository.js';
import { signToken } from '../utils/jwt.js';
import { verifyPassword } from '../utils/password.js';

export async function login({ email, password }) {
	const credentials = usersRepository.findCredentialsByEmail(email);

	// Same error for an unknown email and a wrong password, so the response does not reveal which accounts exist.
	if (!credentials || !(await verifyPassword(password, credentials.passwordHash))) {
		throw new UnauthorizedError('INVALID_CREDENTIALS', 'Invalid email or password');
	}

	return { token: await signToken(credentials.id) };
}
