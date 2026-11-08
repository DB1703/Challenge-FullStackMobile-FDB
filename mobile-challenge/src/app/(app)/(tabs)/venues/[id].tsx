import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Divider, Text, useTheme } from 'react-native-paper';

import { ActivitySchedule } from '@/features/venues/components/activity-schedule';
import { OpeningHours } from '@/features/venues/components/opening-hours';
import { VenueDetailSkeleton } from '@/features/venues/components/venue-detail-skeleton';
import { VenueHeader } from '@/features/venues/components/venue-header';
import { useVenue } from '@/features/venues/hooks/use-venue';
import { EmptyState } from '@/shared/components/empty-state';
import { ErrorState } from '@/shared/components/error-state';
import { isAppError } from '@/shared/errors/app-error';

export default function VenueDetailScreen() {
	const theme = useTheme();
	const { id } = useLocalSearchParams<{ id: string }>();
	const venue = useVenue(id);

	const backToList = () => (router.canGoBack() ? router.back() : router.replace('/venues'));

	return (
		<View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
			{venue.status === 'success' && <Stack.Screen options={{ title: venue.data.name }} />}

			{venue.status === 'loading' && <VenueDetailSkeleton />}

			{venue.status === 'error' &&
				(isAppError(venue.error, 'VENUE_NOT_FOUND') ? (
					<EmptyState
						icon="map-marker-off-outline"
						title="No encontramos esta sede"
						message="Puede que el enlace sea incorrecto o que la sede ya no exista."
						action={{ label: 'Ver sedes', onPress: backToList }}
					/>
				) : (
					<ErrorState message="No pudimos cargar la sede." onRetry={venue.retry} />
				))}

			{venue.status === 'success' && (
				<ScrollView contentContainerStyle={styles.content}>
					<VenueHeader venue={venue.data} />
					<Divider />
					<OpeningHours openingHours={venue.data.openingHours} />
					<Divider />
					<Text variant="titleMedium">Actividades</Text>
					{venue.data.activities.map((activity) => (
						<ActivitySchedule
							key={activity.id}
							activity={activity}
							onSessionPress={(session) =>
								router.push({
									pathname: '/booking',
									params: { venueId: String(venue.data.id), sessionId: String(session.id) },
								})
							}
						/>
					))}
				</ScrollView>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	flex: {
		flex: 1,
	},
	content: {
		padding: 16,
		gap: 16,
	},
});
