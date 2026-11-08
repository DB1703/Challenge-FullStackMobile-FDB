import { StyleSheet, View } from 'react-native';
import { Card, Chip, Text, useTheme } from 'react-native-paper';

import { formatTimeRange, formatWeekday } from '@/shared/utils/dates';

import type { Activity, Session } from '../venues.types';

type ActivityScheduleProps = {
	activity: Activity;
	/** Sessions the user has an upcoming booking for: shown as booked (they can still be booked on another date). */
	bookedSessionIds?: ReadonlySet<number>;
	onSessionPress: (session: Session) => void;
};

export function ActivitySchedule({ activity, bookedSessionIds, onSessionPress }: ActivityScheduleProps) {
	const theme = useTheme();

	return (
		<Card mode="outlined">
			<Card.Content style={styles.content}>
				<Text variant="titleMedium">{activity.name}</Text>
				<Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
					{activity.description}
				</Text>

				{activity.schedule.length === 0 ? (
					<Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
						Sin horarios disponibles
					</Text>
				) : (
					activity.schedule.map((day) => (
						<View key={day.weekday} style={styles.day}>
							<Text variant="labelLarge">{formatWeekday(day.weekday)}</Text>
							<View style={styles.sessions}>
								{day.sessions.map((session) => {
									const booked = bookedSessionIds?.has(session.id) ?? false;
									const timeRange = formatTimeRange(session.startTime, session.endTime);

									return (
										<Chip
											key={session.id}
											icon={booked ? 'check' : 'clock-outline'}
											selected={booked}
											showSelectedOverlay={booked}
											onPress={() => onSessionPress(session)}
											accessibilityLabel={`Reservar ${activity.name}, ${formatWeekday(day.weekday)} ${timeRange}${
												booked ? '. Reservada' : ''
											}`}
										>
											{timeRange}
										</Chip>
									);
								})}
							</View>
						</View>
					))
				)}
			</Card.Content>
		</Card>
	);
}

const styles = StyleSheet.create({
	content: {
		gap: 8,
	},
	day: {
		gap: 6,
		marginTop: 4,
	},
	sessions: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
});
