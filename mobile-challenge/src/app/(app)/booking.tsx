import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { indexVenueSessions } from '@/features/bookings/booking-details';
import { BookingForm } from '@/features/bookings/components/booking-form';
import { useVenue } from '@/features/venues/hooks/use-venue';
import { EmptyState } from '@/shared/components/empty-state';
import { ErrorState } from '@/shared/components/error-state';
import { Skeleton } from '@/shared/components/skeleton';
import { isAppError } from '@/shared/errors/app-error';

export default function BookingScreen() {
	const theme = useTheme();
	const { venueId, sessionId } = useLocalSearchParams<{ venueId: string; sessionId: string }>();
	// Usually instant: the venue detail already loaded it into the shared cache.
	const venue = useVenue(venueId ?? '');

	const details = venue.status === 'success' ? indexVenueSessions([venue.data]).get(Number(sessionId)) : undefined;
	const notFound =
		(venue.status === 'error' && isAppError(venue.error, 'VENUE_NOT_FOUND')) ||
		(venue.status === 'success' && !details);

	return (
		<View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
			{venue.status === 'loading' && (
				<View style={styles.skeleton}>
					<Skeleton width="60%" height={28} />
					<Skeleton width="40%" height={20} />
					<Skeleton height={200} radius={12} />
				</View>
			)}

			{notFound && (
				<EmptyState
					icon="calendar-remove-outline"
					title="Sesión no disponible"
					message="No encontramos la clase que querés reservar."
					action={{ label: 'Cerrar', onPress: () => router.back() }}
				/>
			)}

			{venue.status === 'error' && !notFound && (
				<ErrorState message="No pudimos cargar la clase." onRetry={venue.retry} />
			)}

			{details && <BookingForm details={details} />}
		</View>
	);
}

const styles = StyleSheet.create({
	flex: {
		flex: 1,
	},
	skeleton: {
		padding: 16,
		gap: 12,
	},
});
