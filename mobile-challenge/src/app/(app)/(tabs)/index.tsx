import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { useAuthStore } from '@/features/auth/auth.store';

export default function HomeScreen() {
	const theme = useTheme();
	// Subscribed to the session store, so a name change in the profile shows up here right away.
	const firstName = useAuthStore((state) => state.user?.firstName);

	return (
		<View style={[styles.container, { backgroundColor: theme.colors.background }]}>
			<Text variant="headlineSmall">Hola, {firstName}</Text>
			<Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
				Acá vas a ver tus próximas reservas.
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		gap: 4,
	},
});
