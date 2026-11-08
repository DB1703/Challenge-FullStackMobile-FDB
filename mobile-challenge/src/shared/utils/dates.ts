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
