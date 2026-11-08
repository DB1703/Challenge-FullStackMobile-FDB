import { selectImplementation } from '@/shared/config/select-implementation';

import { localAuthRepository } from './auth.repository.local';
import type { Credentials, LoginResult } from './auth.types';

export interface AuthRepository {
	/** Throws `INVALID_CREDENTIALS` for both an unknown email and a wrong password. */
	login(credentials: Credentials): Promise<LoginResult>;
}

export const authRepository = selectImplementation<AuthRepository>({
	local: localAuthRepository,
});
