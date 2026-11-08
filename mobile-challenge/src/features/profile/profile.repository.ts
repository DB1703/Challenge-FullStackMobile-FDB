import { selectImplementation } from '@/shared/config/select-implementation';

import { localProfileRepository } from './profile.repository.local';
import type { UpdateProfileInput, User } from './profile.types';

/** Protected operations: they receive the session token explicitly. */
export interface ProfileRepository {
	getProfile(token: string): Promise<User>;
	/** Full replacement of the editable fields, like `PUT /users/me`. */
	updateProfile(token: string, input: UpdateProfileInput): Promise<User>;
}

export const profileRepository = selectImplementation<ProfileRepository>({
	local: localProfileRepository,
});
