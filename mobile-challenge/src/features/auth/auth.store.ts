import * as SecureStore from 'expo-secure-store';
import Storage from 'expo-sqlite/kv-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { profileRepository } from '@/features/profile/profile.repository';
import type { UpdateProfileInput, User } from '@/features/profile/profile.types';
import { isAppError } from '@/shared/errors/app-error';
import { readTokenExpiration } from '@/shared/utils/jwt';

import { authRepository } from './auth.repository';
import type { Credentials } from './auth.types';

// The user is persisted by `persist` (expo-sqlite kv-store); the token, explicitly in SecureStore.
const TOKEN_KEY = 'auth.token';

type AuthState = {
	token: string | null;
	user: User | null;
	/** False until the saved user and token are loaded: navigation waits for it (splash screen). */
	isHydrated: boolean;
	/** Set when the session ends because of an expired or invalid token; the UI shows a notice and clears it. */
	sessionExpired: boolean;
	login: (credentials: Credentials) => Promise<void>;
	logout: () => Promise<void>;
	updateProfile: (input: UpdateProfileInput) => Promise<User>;
	clearSessionExpired: () => void;
};

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			token: null,
			user: null,
			isHydrated: false,
			sessionExpired: false,

			// Errors propagate to the caller. The session is only set once every step succeeded.
			async login(credentials) {
				const { token } = await authRepository.login(credentials);
				const user = await profileRepository.getProfile(token);
				await SecureStore.setItemAsync(TOKEN_KEY, token);
				set({ token, user, sessionExpired: false });
			},

			async logout() {
				try {
					await SecureStore.deleteItemAsync(TOKEN_KEY);
				} catch (error) {
					// The state is cleared anyway; an orphan token is discarded on the next hydration.
					console.warn('Could not delete the saved token', error);
				}
				set({ token: null, user: null });
			},

			async updateProfile(input) {
				const { token, result: user } = await runProtected((currentToken) =>
					profileRepository.updateProfile(currentToken, input),
				);
				// Only reflect the change if the session is still the one that made it.
				if (useAuthStore.getState().token === token) {
					set({ user });
				}
				return user;
			},

			clearSessionExpired() {
				set({ sessionExpired: false });
			},
		}),
		{
			name: 'auth-session',
			version: 1,
			storage: createJSONStorage(() => Storage),
			partialize: (state) => ({ user: state.user }),
			// The storage is async, so this runs after `useAuthStore` is assigned.
			onRehydrateStorage: () => (_state, error) => {
				if (error) {
					console.warn('Could not restore the saved user', error);
				}
				void completeHydration();
			},
		},
	),
);

/** The session is active only when both the token and the user exist. */
export function useIsLoggedIn(): boolean {
	return useAuthStore((state) => state.token !== null && state.user !== null);
}

function isSessionError(error: unknown): boolean {
	return isAppError(error, 'TOKEN_EXPIRED') || isAppError(error, 'TOKEN_INVALID');
}

async function expireSession(): Promise<void> {
	await useAuthStore.getState().logout();
	useAuthStore.setState({ sessionExpired: true });
}

/**
 * The single place where session errors are handled: every protected operation goes through here.
 * `TOKEN_EXPIRED` and `TOKEN_INVALID` end the session (protected routes then show the login) and are
 * rethrown so the caller stops its flow. Resolves with the operation's result and the token it used.
 */
async function runProtected<T>(operation: (token: string) => Promise<T>): Promise<{ token: string; result: T }> {
	const token = useAuthStore.getState().token ?? '';
	try {
		return { token, result: await operation(token) };
	} catch (error) {
		// Ignore failures of a token that is no longer the current one (e.g. the user logged out meanwhile).
		if (isSessionError(error) && useAuthStore.getState().token === token) {
			await expireSession();
		}
		throw error;
	}
}

function isExpired(token: string): boolean {
	const expiration = readTokenExpiration(token);
	return expiration !== null && expiration <= Date.now() / 1000;
}

// Runs once `persist` has restored the user: loads the token and decides the initial session.
async function completeHydration(): Promise<void> {
	let token: string | null = null;

	try {
		token = await SecureStore.getItemAsync(TOKEN_KEY);
		const { user } = useAuthStore.getState();

		if (!token || !user) {
			// A token without a user (or the other way around) is not a session: discard what is left.
			if (token || user) {
				await useAuthStore.getState().logout();
			}
			token = null;
		} else if (isExpired(token)) {
			// Decided before hiding the splash screen, so the user goes straight to the login with the notice.
			// The signature isn't verified here; an undecodable token is rejected by the revalidation below.
			await expireSession();
			token = null;
		}
	} catch (error) {
		console.warn('Could not restore the session', error);
		token = null;
		useAuthStore.setState({ user: null });
	}

	useAuthStore.setState({ token, isHydrated: true });

	if (token) {
		void revalidateSession();
	}
}

// Refreshes the user in the background. Session errors are handled by runProtected; any other error
// (e.g. no network in api mode) keeps the current session.
async function revalidateSession(): Promise<void> {
	try {
		const { token, result: user } = await runProtected((currentToken) =>
			profileRepository.getProfile(currentToken),
		);
		if (useAuthStore.getState().token === token) {
			useAuthStore.setState({ user });
		}
	} catch {
		// Already handled or deliberately ignored (see above).
	}
}
