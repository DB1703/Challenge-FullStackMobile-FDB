import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import type { Venue } from '../venues.types';

export function VenueHeader({ venue }: { venue: Venue }) {
	const theme = useTheme();
	const muted = { color: theme.colors.onSurfaceVariant };

	return (
		<View style={styles.container}>
			<Text variant="headlineSmall">{venue.name}</Text>
			<View style={styles.row}>
				<MaterialCommunityIcons name="map-marker-outline" size={18} color={theme.colors.onSurfaceVariant} />
				<Text variant="bodyMedium" style={styles.rowText}>
					{venue.address}
				</Text>
			</View>
			<View style={styles.row}>
				<MaterialCommunityIcons name="information-outline" size={18} color={theme.colors.onSurfaceVariant} />
				<Text variant="bodyMedium" style={[styles.rowText, muted]}>
					{venue.location}
				</Text>
			</View>
			<Text variant="bodyMedium" style={styles.description}>
				{venue.description}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		gap: 8,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 8,
	},
	rowText: {
		flex: 1,
	},
	description: {
		marginTop: 4,
	},
});
