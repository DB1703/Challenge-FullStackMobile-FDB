import { useEffect } from 'react';

import { useSnackbar } from '@/shared/components/snackbar-provider';

import { useAuthStore } from '../auth.store';

/**
 * Bridges the session store (not a component) with the snackbars: when the session ends because of an
 * expired or invalid token, shows the notice once. Mounted once, in the root layout.
 */
export function SessionExpiredNotifier() {
	const sessionExpired = useAuthStore((state) => state.sessionExpired);
	const clearSessionExpired = useAuthStore((state) => state.clearSessionExpired);
	const { showError } = useSnackbar();

	useEffect(() => {
		if (sessionExpired) {
			showError('Tu sesión expiró. Volvé a ingresar.');
			clearSessionExpired();
		}
	}, [sessionExpired, clearSessionExpired, showError]);

	return null;
}
