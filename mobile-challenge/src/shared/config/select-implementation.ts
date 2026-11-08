import { env, type DataSource } from './env';

type Implementations<T> = { local: T } & Partial<Record<Exclude<DataSource, 'local'>, T>>;

/** Picks the repository implementation for the configured data source. */
export function selectImplementation<T>(implementations: Implementations<T>): T {
	const implementation = implementations[env.dataSource];
	if (!implementation) {
		throw new Error(`No "${env.dataSource}" implementation available for this repository.`);
	}
	return implementation;
}
