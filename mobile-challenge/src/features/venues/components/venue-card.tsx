import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';

import type { VenueSummary } from '../venues.types';

type VenueCardProps = {
	venue: VenueSummary;
	onPress: () => void;
};

export function VenueCard({ venue, onPress }: VenueCardProps) {
	const theme = useTheme();

	return (
		<Card mode="elevated" onPress={onPress} accessibilityLabel={`Ver ${venue.name}`}>
			<Card.Content style={styles.content}>
				<Text variant="titleLarge">{venue.name}</Text>
				<View style={styles.row}>
					<MaterialCommunityIcons name="map-marker-outline" size={18} color={theme.colors.onSurfaceVariant} />
					<Text variant="bodyMedium" style={styles.rowText}>
						{venue.address}
					</Text>
				</View>
				<View style={styles.row}>
					<MaterialCommunityIcons name="information-outline" size={18} color={theme.colors.onSurfaceVariant} />
					<Text variant="bodyMedium" style={[styles.rowText, { color: theme.colors.onSurfaceVariant }]}>
						{venue.location}
					</Text>
				</View>
			</Card.Content>
		</Card>
	);
}

const styles = StyleSheet.create({
	content: {
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
});
