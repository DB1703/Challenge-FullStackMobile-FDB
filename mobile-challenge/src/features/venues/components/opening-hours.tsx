import { getISODay } from 'date-fns';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { formatTimeRange, formatWeekday } from '@/shared/utils/dates';

import type { OpeningHours as OpeningHoursEntry, Weekday } from '../venues.types';

const WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5, 6, 7];

/**
 * Always lists Monday to Sunday: closed days don't come in the data, so they are shown as "Cerrado"
 * instead of missing. Today is highlighted.
 */
export function OpeningHours({ openingHours }: { openingHours: OpeningHoursEntry[] }) {
	const theme = useTheme();
	const today = getISODay(new Date());
	const hoursByDay = new Map(openingHours.map((entry) => [entry.weekday, entry]));

	return (
		<View style={styles.container}>
			<Text variant="titleMedium">Horarios</Text>
			{WEEKDAYS.map((weekday) => {
				const hours = hoursByDay.get(weekday);
				const isToday = weekday === today;
				const textStyle = [
					isToday && styles.today,
					!hours && { color: theme.colors.onSurfaceVariant },
				];

				return (
					<View
						key={weekday}
						style={styles.row}
						accessible
						accessibilityLabel={`${formatWeekday(weekday)}${isToday ? ' (hoy)' : ''}: ${
							hours ? `de ${hours.opensAt} a ${hours.closesAt}` : 'cerrado'
						}`}
					>
						<Text variant="bodyMedium" style={textStyle}>
							{formatWeekday(weekday)}
							{isToday ? ' (hoy)' : ''}
						</Text>
						<Text variant="bodyMedium" style={textStyle}>
							{hours ? formatTimeRange(hours.opensAt, hours.closesAt) : 'Cerrado'}
						</Text>
					</View>
				);
			})}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		gap: 6,
	},
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	today: {
		fontWeight: 'bold',
	},
});
