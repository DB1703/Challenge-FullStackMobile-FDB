import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { useAuthStore } from '@/features/auth/auth.store';
import { HomeBookings } from '@/features/bookings/components/home-bookings';

export default function HomeScreen() {
	const theme = useTheme();
	// Subscribed to the session store, so a name change in the profile shows up here right away.
	const firstName = useAuthStore((state) => state.user?.firstName);

	return (
		<ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={styles.content}>
			<View style={styles.greeting}>
				<Text variant="headlineSmall">Hola, {firstName}</Text>
				<Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
					Estas son tus reservas.
				</Text>
			</View>
			<HomeBookings />
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	content: {
		padding: 16,
		gap: 24,
	},
	greeting: {
		gap: 4,
	},
});
