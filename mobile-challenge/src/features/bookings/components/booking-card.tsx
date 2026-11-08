import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Text, useTheme } from 'react-native-paper';

import { formatFullDate, formatTimeRange } from '@/shared/utils/dates';

import type { ResolvedBooking } from '../bookings.types';

type BookingCardProps = {
	booking: ResolvedBooking;
	/** Only upcoming bookings can be cancelled; past ones are shown dimmed, without actions. */
	onCancel?: () => void;
};

export function BookingCard({ booking, onCancel }: BookingCardProps) {
	const theme = useTheme();
	const { details } = booking;
	const muted = { color: theme.colors.onSurfaceVariant };

	return (
		<Card mode={onCancel ? 'elevated' : 'outlined'} style={!onCancel && styles.past}>
			<Card.Content style={styles.content}>
				<Text variant="titleMedium">{details?.activity.name ?? 'Sesión no disponible'}</Text>
				{details && (
					<View style={styles.row}>
						<MaterialCommunityIcons name="map-marker-outline" size={16} color={theme.colors.onSurfaceVariant} />
						<Text variant="bodyMedium" style={muted}>
							{details.venue.name}
						</Text>
					</View>
				)}
				<View style={styles.row}>
					<MaterialCommunityIcons name="calendar" size={16} color={theme.colors.onSurfaceVariant} />
					<Text variant="bodyMedium">{formatFullDate(booking.startsAt)}</Text>
				</View>
				{details && (
					<View style={styles.row}>
						<MaterialCommunityIcons name="clock-outline" size={16} color={theme.colors.onSurfaceVariant} />
						<Text variant="bodyMedium">
							{formatTimeRange(details.session.startTime, details.session.endTime)}
						</Text>
					</View>
				)}
			</Card.Content>
			{onCancel && (
				<Card.Actions>
					<Button textColor={theme.colors.error} onPress={onCancel}>
						Cancelar
					</Button>
				</Card.Actions>
			)}
		</Card>
	);
}

const styles = StyleSheet.create({
	content: {
		gap: 6,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	past: {
		opacity: 0.7,
	},
});
