import { useState } from 'react';
import { Button } from 'react-native-paper';

import { useAuthStore } from '@/features/auth/auth.store';
import { ConfirmDialog } from '@/shared/components/confirm-dialog';

/** Asks for confirmation; after logout, the protected routes show the login. */
export function LogoutButton() {
	const logout = useAuthStore((state) => state.logout);
	const [confirmVisible, setConfirmVisible] = useState(false);

	return (
		<>
			<Button mode="outlined" icon="logout" onPress={() => setConfirmVisible(true)}>
				Cerrar sesión
			</Button>
			<ConfirmDialog
				visible={confirmVisible}
				title="¿Cerrar sesión?"
				message="Vas a tener que volver a ingresar para reservar clases."
				confirmLabel="Cerrar sesión"
				onConfirm={() => {
					setConfirmVisible(false);
					void logout();
				}}
				onDismiss={() => setConfirmVisible(false)}
			/>
		</>
	);
}
