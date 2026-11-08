import Storage from 'expo-sqlite/kv-store';

import usersData from '@/data/users.json';

import type { User } from './profile.types';

// Local stand-in for the backend's users table: the JSON is the seed, and profile changes are
// stored on the device and take precedence. The password always comes from the JSON (not editable).

type UserRecord = User & { password: string };

const seedUsers = usersData as UserRecord[];

const storageKey = (id: number) => `local-data:users:${id}`;

async function readStoredUser(id: number): Promise<User | null> {
	const value = await Storage.getItem(storageKey(id));
	return value ? (JSON.parse(value) as User) : null;
}

function toUser({ password: _password, ...user }: UserRecord): User {
	return user;
}

async function loadUsers(): Promise<UserRecord[]> {
	return Promise.all(
		seedUsers.map(async (seedUser) => {
			const storedUser = await readStoredUser(seedUser.id);
			return storedUser ? { ...storedUser, password: seedUser.password } : seedUser;
		}),
	);
}

export async function findUserById(id: number): Promise<User | null> {
	const user = (await loadUsers()).find((candidate) => candidate.id === id);
	return user ? toUser(user) : null;
}

/** For authentication only: the password must never leave the local repositories. */
export async function findCredentialsByEmail(email: string): Promise<{ id: number; password: string } | null> {
	const user = (await loadUsers()).find((candidate) => candidate.email === email);
	return user ? { id: user.id, password: user.password } : null;
}

export async function isEmailUsedByOtherUser(email: string, userId: number): Promise<boolean> {
	return (await loadUsers()).some((candidate) => candidate.email === email && candidate.id !== userId);
}

export async function saveUser(user: User): Promise<void> {
	await Storage.setItem(storageKey(user.id), JSON.stringify(user));
}
