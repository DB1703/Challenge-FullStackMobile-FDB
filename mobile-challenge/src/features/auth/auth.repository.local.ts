import { findCredentialsByEmail } from '@/features/profile/profile.local-data';
import { AppError } from '@/shared/errors/app-error';
import { simulateLatency } from '@/shared/utils/simulate-latency';
import { parseOrThrow } from '@/shared/utils/validation';

import type { AuthRepository } from './auth.repository';
import { loginSchema } from './auth.schemas';
import { createLocalToken } from './local-token';

export const localAuthRepository: AuthRepository = {
	async login(credentials) {
		await simulateLatency();
		const { email, password } = parseOrThrow(loginSchema, credentials);

		// Uses the profile saved on the device if there is one, so an email change works like in the API.
		const user = await findCredentialsByEmail(email);

		// Same error for an unknown email and a wrong password, so it doesn't reveal which accounts exist.
		// Plain-text comparison: this is a mock with test data (the API uses bcrypt).
		if (!user || user.password !== password) {
			throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password');
		}

		return { token: createLocalToken(user.id) };
	},
};
