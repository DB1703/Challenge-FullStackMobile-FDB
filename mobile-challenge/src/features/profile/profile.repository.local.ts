import { verifyLocalToken } from '@/features/auth/local-token';
import { AppError } from '@/shared/errors/app-error';
import { simulateLatency } from '@/shared/utils/simulate-latency';
import { parseOrThrow } from '@/shared/utils/validation';

import { findUserById, isEmailUsedByOtherUser, saveUser } from './profile.local-data';
import type { ProfileRepository } from './profile.repository';
import { updateProfileSchema } from './profile.schemas';
import type { User } from './profile.types';

// A valid token whose user no longer exists is treated as an invalid token, like the API.
async function findUserOrThrow(userId: number): Promise<User> {
	const user = await findUserById(userId);
	if (!user) {
		throw new AppError('TOKEN_INVALID', 'Token is invalid');
	}
	return user;
}

export const localProfileRepository: ProfileRepository = {
	async getProfile(token) {
		await simulateLatency();
		return findUserOrThrow(verifyLocalToken(token));
	},

	// Same order as the API: authentication (401) before validation (400).
	async updateProfile(token, input) {
		await simulateLatency();
		const userId = verifyLocalToken(token);
		const changes = parseOrThrow(updateProfileSchema, input);
		const user = await findUserOrThrow(userId);

		if (await isEmailUsedByOtherUser(changes.email, userId)) {
			throw new AppError('EMAIL_ALREADY_IN_USE', 'Email is already in use');
		}

		const updatedUser: User = { ...user, ...changes };
		await saveUser(updatedUser);
		return updatedUser;
	},
};
