import { format, isValid, parse } from 'date-fns';
import { es } from 'date-fns/locale/es';

/**
 * Parses a date without time (`YYYY-MM-DD`, e.g. `birthDate`) as local midnight.
 * `new Date('1995-04-12')` would be UTC midnight, which is the previous day in Argentina.
 */
export function parseDateOnly(value: string): Date {
	const date = parse(value, 'yyyy-MM-dd', new Date());
	if (!isValid(date)) {
		throw new Error(`Invalid date "${value}". Expected YYYY-MM-DD.`);
	}
	return date;
}

/** e.g. "12 de abril de 1995" */
export function formatLongDate(date: Date): string {
	return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
}

function capitalize(value: string): string {
	return value.charAt(0).toUpperCase() + value.slice(1);
}

/** ISO 8601 weekday (1 = Monday … 7 = Sunday) → "Lunes" … "Domingo". */
export function formatWeekday(isoWeekday: number): string {
	// date-fns' locale counts days from Sunday = 0.
	return capitalize(es.localize.day((isoWeekday % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6, { width: 'wide' }));
}

/** `HH:MM` times → "08:00 – 09:00" */
export function formatTimeRange(start: string, end: string): string {
	return `${start} – ${end}`;
}
