import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, useTheme } from 'react-native-paper';

import { useAuthStore } from '@/features/auth/auth.store';
import { LogoutButton } from '@/features/profile/components/logout-button';
import { ProfileDetails } from '@/features/profile/components/profile-details';

export default function ProfileScreen() {
	const theme = useTheme();
	const user = useAuthStore((state) => state.user);

	// The protected routes only render this screen with a session; `user` is null only while logging out.
	if (!user) {
		return null;
	}

	return (
		<ScrollView
			style={{ backgroundColor: theme.colors.background }}
			contentContainerStyle={styles.content}
		>
			<ProfileDetails user={user} />
			<View style={styles.actions}>
				<Button mode="contained-tonal" icon="pencil" onPress={() => router.push('/profile/edit')}>
					Editar perfil
				</Button>
				<LogoutButton />
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	content: {
		paddingBottom: 24,
	},
	actions: {
		gap: 12,
		paddingHorizontal: 16,
	},
});
