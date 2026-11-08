import { router } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { VenueCard } from '@/features/venues/components/venue-card';
import { VenueListSkeleton } from '@/features/venues/components/venue-list-skeleton';
import { useVenues } from '@/features/venues/hooks/use-venues';
import { EmptyState } from '@/shared/components/empty-state';
import { ErrorState } from '@/shared/components/error-state';

export default function VenuesScreen() {
	const theme = useTheme();
	const venues = useVenues();

	return (
		<View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
			{venues.status === 'loading' && <VenueListSkeleton />}

			{venues.status === 'error' && <ErrorState message="No pudimos cargar las sedes." onRetry={venues.retry} />}

			{venues.status === 'success' && (
				<FlatList
					data={venues.data}
					keyExtractor={(venue) => String(venue.id)}
					contentContainerStyle={styles.list}
					renderItem={({ item }) => (
						<VenueCard
							venue={item}
							onPress={() => router.push({ pathname: '/venues/[id]', params: { id: String(item.id) } })}
						/>
					)}
					ListEmptyComponent={<EmptyState icon="office-building-outline" title="No hay sedes disponibles." />}
				/>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	flex: {
		flex: 1,
	},
	list: {
		padding: 16,
		gap: 12,
	},
});
