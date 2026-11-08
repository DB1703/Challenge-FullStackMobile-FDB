import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, RadioButton, Surface, Text, useTheme } from 'react-native-paper';

import { useSnackbar } from '@/shared/components/snackbar-provider';
import { useNow } from '@/shared/hooks/use-now';
import { formatDayMonth, formatFullDate, formatTimeRange, formatWeekday, parseDateOnly } from '@/shared/utils/dates';

import { findOverlaps, getAvailableDates } from '../booking-rules';
import { BookingError } from '../bookings.errors';
import { useBookingsStore, useUserBookings } from '../bookings.store';
import type { BookingDetails } from '../bookings.types';
import { useResolvedBookings } from '../hooks/use-resolved-bookings';

const AUTO_CLOSE_MS = 2500;

function bookingErrorMessage(error: unknown): string {
	if (error instanceof BookingError) {
		switch (error.code) {
			case 'BOOKING_DUPLICATE':
				return 'Ya tenés reservada esta clase en esa fecha.';
			case 'SESSION_ALREADY_STARTED':
				return 'Esa clase ya empezó. Elegí otra fecha.';
			case 'DATE_NOT_AVAILABLE':
				return 'Esa fecha ya no está disponible. Elegí otra.';
		}
	}
	return 'No pudimos confirmar la reserva. Intentá de nuevo.';
}

type BookingFormProps = {
	details: BookingDetails;
};

export function BookingForm({ details }: BookingFormProps) {
	const theme = useTheme();
	const now = useNow();
	const { venue, activity, session } = details;
	const timeRange = formatTimeRange(session.startTime, session.endTime);

	const createBooking = useBookingsStore((state) => state.createBooking);
	const userBookings = useUserBookings();
	const { upcoming } = useResolvedBookings(now);
	const { showError } = useSnackbar();

	// Dates of the next 4 weeks; the ones already booked are shown but disabled.
	const dates = useMemo(
		() => getAvailableDates(session.weekday, session.startTime, now),
		[session.weekday, session.startTime, now],
	);
	const bookedDates = useMemo(
		() => new Set(userBookings.filter((booking) => booking.sessionId === session.id).map((booking) => booking.date)),
		[userBookings, session.id],
	);
	const selectableDates = dates.filter((date) => !bookedDates.has(date));

	const [selectedDate, setSelectedDate] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [confirmedDate, setConfirmedDate] = useState<string | null>(null);

	// The selection falls back to the first selectable date (also if the chosen one stops being available).
	const date = selectedDate && selectableDates.includes(selectedDate) ? selectedDate : (selectableDates[0] ?? null);

	// Overlap with other upcoming bookings of the user (any venue): a warning, booking is still allowed.
	const overlapping = useMemo(() => {
		if (!date) return [];
		const others = upcoming.flatMap((booking) =>
			booking.details
				? [{ date: booking.date, startTime: booking.details.session.startTime, endTime: booking.details.session.endTime, booking }]
				: [],
		);
		return findOverlaps({ date, startTime: session.startTime, endTime: session.endTime }, others);
	}, [date, upcoming, session.startTime, session.endTime]);

	useEffect(() => {
		if (!confirmedDate) return;
		const timer = setTimeout(() => router.back(), AUTO_CLOSE_MS);
		return () => clearTimeout(timer);
	}, [confirmedDate]);

	const confirm = async () => {
		if (!date) return;
		setIsSubmitting(true);
		try {
			await createBooking({ venueId: venue.id, session, date });
			setConfirmedDate(date);
		} catch (error) {
			showError(bookingErrorMessage(error));
		} finally {
			setIsSubmitting(false);
		}
	};

	if (confirmedDate) {
		return (
			<View style={[styles.success, { backgroundColor: theme.colors.background }]}>
				<MaterialCommunityIcons name="check-circle" size={72} color={theme.colors.primary} />
				<Text variant="headlineSmall">¡Reserva confirmada!</Text>
				<Text variant="bodyLarge" style={styles.centered}>
					{activity.name} en {venue.name}
				</Text>
				<Text variant="bodyMedium" style={[styles.centered, { color: theme.colors.onSurfaceVariant }]}>
					{formatFullDate(parseDateOnly(confirmedDate))} · {timeRange}
				</Text>
				<Button mode="contained" onPress={() => router.back()} style={styles.successButton}>
					Listo
				</Button>
			</View>
		);
	}

	return (
		<ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={styles.content}>
			<View style={styles.summary}>
				<Text variant="headlineSmall">{activity.name}</Text>
				<Text variant="bodyLarge">{venue.name}</Text>
				<Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
					{formatWeekday(session.weekday)} · {timeRange}
				</Text>
			</View>

			<View>
				<Text variant="titleMedium" style={styles.sectionTitle}>
					Elegí la fecha
				</Text>
				{dates.length === 0 || selectableDates.length === 0 ? (
					<Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
						No hay fechas disponibles en las próximas 4 semanas.
					</Text>
				) : (
					<RadioButton.Group value={date ?? ''} onValueChange={setSelectedDate}>
						{dates.map((dateKey) => {
							const booked = bookedDates.has(dateKey);
							const label = formatDayMonth(parseDateOnly(dateKey));
							return (
								<RadioButton.Item
									key={dateKey}
									value={dateKey}
									label={booked ? `${label} · Ya reservada` : label}
									disabled={booked || isSubmitting}
									labelStyle={booked ? { color: theme.colors.onSurfaceDisabled } : undefined}
									accessibilityLabel={booked ? `${label}, ya reservada` : label}
								/>
							);
						})}
					</RadioButton.Group>
				)}
			</View>

			{overlapping.length > 0 && (
				<Surface style={[styles.warning, { backgroundColor: theme.colors.tertiaryContainer }]} elevation={0}>
					<MaterialCommunityIcons name="alert-outline" size={22} color={theme.colors.onTertiaryContainer} />
					<Text variant="bodyMedium" style={[styles.warningText, { color: theme.colors.onTertiaryContainer }]}>
						Se superpone con{' '}
						{overlapping
							.map(
								({ booking }) =>
									`${booking.details?.activity.name} (${booking.details?.venue.name}, ${formatTimeRange(
										booking.details?.session.startTime ?? '',
										booking.details?.session.endTime ?? '',
									)})`,
							)
							.join(' y ')}
						. Podés reservar igual.
					</Text>
				</Surface>
			)}

			<Button
				mode="contained"
				onPress={() => void confirm()}
				loading={isSubmitting}
				disabled={!date || isSubmitting}
			>
				Confirmar reserva
			</Button>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	content: {
		padding: 16,
		gap: 20,
	},
	summary: {
		gap: 4,
	},
	sectionTitle: {
		marginBottom: 4,
	},
	warning: {
		flexDirection: 'row',
		gap: 12,
		padding: 12,
		borderRadius: 12,
		alignItems: 'flex-start',
	},
	warningText: {
		flex: 1,
	},
	success: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		gap: 12,
		padding: 24,
	},
	centered: {
		textAlign: 'center',
	},
	successButton: {
		marginTop: 12,
	},
});
