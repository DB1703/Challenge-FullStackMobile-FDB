import { router } from 'expo-router';
import { Button, Text } from 'react-native-paper';

import { useAuthStore } from '@/features/auth/auth.store';
import { ScreenPlaceholder } from '@/shared/components/screen-placeholder';

// Placeholder until the profile task, which integrates the logout button into the final screen.
export default function ProfileScreen() {
	const user = useAuthStore((state) => state.user);
	const logout = useAuthStore((state) => state.logout);

	return (
		<ScreenPlaceholder title="Perfil">
			{user && (
				<>
					<Text variant="titleMedium">
						{user.firstName} {user.lastName}
					</Text>
					<Text variant="bodyMedium">{user.email}</Text>
				</>
			)}
			<Button mode="contained" onPress={() => router.push('/profile/edit')}>
				Editar perfil
			</Button>
			<Button mode="outlined" onPress={logout}>
				Cerrar sesión
			</Button>
		</ScreenPlaceholder>
	);
}
