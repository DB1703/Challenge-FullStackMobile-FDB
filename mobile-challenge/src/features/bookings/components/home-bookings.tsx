import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Text, useTheme } from 'react-native-paper';

import { ConfirmDialog } from '@/shared/components/confirm-dialog';
import { EmptyState } from '@/shared/components/empty-state';
import { ErrorState } from '@/shared/components/error-state';
import { Skeleton } from '@/shared/components/skeleton';
import { useSnackbar } from '@/shared/components/snackbar-provider';
import { useNow } from '@/shared/hooks/use-now';

import { useBookingsStore } from '../bookings.store';
import type { ResolvedBooking } from '../bookings.types';
import { useResolvedBookings } from '../hooks/use-resolved-bookings';
import { BookingCard } from './booking-card';

const goToVenues = () => router.push('/venues');

function BookingsSkeleton() {
	return (
		<View style={styles.list}>
			{[0, 1].map((index) => (
				<Card key={index} mode="elevated">
					<Card.Content style={styles.skeletonContent}>
						<Skeleton width="50%" height={20} />
						<Skeleton width="40%" height={16} />
						<Skeleton width="70%" height={16} />
						<Skeleton width="35%" height={16} />
					</Card.Content>
				</Card>
			))}
		</View>
	);
}

/** Upcoming and past bookings of the user, with cancellation of upcoming ones. */
export function HomeBookings() {
	const theme = useTheme();
	const now = useNow();
	const bookings = useResolvedBookings(now);
	const cancelBooking = useBookingsStore((state) => state.cancelBooking);
	const { showSuccess, showError } = useSnackbar();
	const [toCancel, setToCancel] = useState<ResolvedBooking | null>(null);

	const confirmCancel = async () => {
		const booking = toCancel;
		setToCancel(null);
		if (!booking) return;

		try {
			await cancelBooking(booking.id, booking.details?.session.startTime ?? '23:59');
			showSuccess('Reserva cancelada.');
		} catch {
			// e.g. the session started while the dialog was open.
			showError('No pudimos cancelar la reserva.');
		}
	};

	if (bookings.status === 'loading') {
		return <BookingsSkeleton />;
	}

	if (bookings.status === 'error') {
		return <ErrorState message="No pudimos cargar tus reservas." onRetry={bookings.retry} />;
	}

	if (bookings.total === 0) {
		return (
			<EmptyState
				icon="calendar-blank-outline"
				title="Todavía no tenés reservas"
				message="Elegí una sede y reservá tu primera clase."
				action={{ label: 'Ver sedes', onPress: goToVenues }}
			/>
		);
	}

	return (
		<View style={styles.sections}>
			<View style={styles.list}>
				<Text variant="titleMedium">Próximas</Text>
				{bookings.upcoming.length === 0 ? (
					<View style={styles.inlineEmpty}>
						<Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
							No tenés reservas próximas.
						</Text>
						<Button mode="text" onPress={goToVenues}>
							Ver sedes
						</Button>
					</View>
				) : (
					bookings.upcoming.map((booking) => (
						<BookingCard key={booking.id} booking={booking} onCancel={() => setToCancel(booking)} />
					))
				)}
			</View>

			{bookings.past.length > 0 && (
				<View style={styles.list}>
					<Text variant="titleMedium">Pasadas</Text>
					{bookings.past.map((booking) => (
						<BookingCard key={booking.id} booking={booking} />
					))}
				</View>
			)}

			<ConfirmDialog
				visible={toCancel !== null}
				title="¿Cancelar la reserva?"
				message={toCancel?.details ? `${toCancel.details.activity.name} en ${toCancel.details.venue.name}.` : undefined}
				confirmLabel="Cancelar reserva"
				cancelLabel="Volver"
				destructive
				onConfirm={() => void confirmCancel()}
				onDismiss={() => setToCancel(null)}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	sections: {
		gap: 24,
	},
	list: {
		gap: 12,
	},
	skeletonContent: {
		gap: 10,
	},
	inlineEmpty: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
});
