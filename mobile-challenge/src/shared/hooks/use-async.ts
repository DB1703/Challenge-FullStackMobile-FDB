import { useCallback, useEffect, useState, type DependencyList } from 'react';

export type AsyncState<T> =
	| { status: 'loading' }
	| { status: 'error'; error: unknown }
	| { status: 'success'; data: T };

export type AsyncResult<T> = AsyncState<T> & {
	/** Runs the load again (e.g. a "Reintentar" button). */
	retry: () => void;
};

/**
 * Runs `load` when `deps` change and exposes its loading, error and success states.
 * Results that arrive after a newer load started (or after unmounting) are ignored.
 */
export function useAsync<T>(load: () => Promise<T>, deps: DependencyList): AsyncResult<T> {
	const [state, setState] = useState<AsyncState<T>>({ status: 'loading' });
	const [attempt, setAttempt] = useState(0);

	useEffect(() => {
		let active = true;
		setState({ status: 'loading' });

		load().then(
			(data) => {
				if (active) {
					setState({ status: 'success', data });
				}
			},
			(error: unknown) => {
				if (active) {
					setState({ status: 'error', error });
				}
			},
		);

		return () => {
			active = false;
		};
		// `load` is recreated on every render; `deps` declares what it depends on.
	}, [...deps, attempt]);

	const retry = useCallback(() => setAttempt((value) => value + 1), []);

	return { ...state, retry };
}
