import { addDays, format, getISODay, parse, startOfDay } from 'date-fns';

import type { Weekday } from '@/features/venues/venues.types';

// Pure booking rules. Dates without time are `YYYY-MM-DD` keys interpreted in local time,
// never with `new Date('YYYY-MM-DD')` (that is UTC midnight, the previous day in Argentina).

/** Rolling window from today (inclusive): 4 weeks. */
export const BOOKING_WINDOW_DAYS = 28;

export function toDateKey(date: Date): string {
	return format(date, 'yyyy-MM-dd');
}

/** Local date and time of a session on a given date. `time` is `HH:MM`. */
export function getSessionDateTime(dateKey: string, time: string): Date {
	return parse(`${dateKey} ${time}`, 'yyyy-MM-dd HH:mm', new Date());
}

/**
 * Dates of the session's weekday within the window, excluding those that already started
 * (only today's can). Weekdays are ISO 8601, like the API: 1 = Monday, 7 = Sunday.
 */
export function getAvailableDates(weekday: Weekday, startTime: string, now: Date): string[] {
	const today = startOfDay(now);
	const firstOffset = (weekday - getISODay(today) + 7) % 7;
	const dates: string[] = [];

	for (let offset = firstOffset; offset < BOOKING_WINDOW_DAYS; offset += 7) {
		const dateKey = toDateKey(addDays(today, offset));
		if (getSessionDateTime(dateKey, startTime) > now) {
			dates.push(dateKey);
		}
	}

	return dates;
}

/** A booking is upcoming until its session starts; from then on it is past and can't be cancelled. */
export function isUpcoming(dateKey: string, startTime: string, now: Date): boolean {
	return getSessionDateTime(dateKey, startTime) > now;
}

type TimeSlot = { date: string; startTime: string; endTime: string };

/** Slots on the same date whose times intersect. Back-to-back slots (one ends as the other starts) don't overlap. */
export function overlaps(a: TimeSlot, b: TimeSlot): boolean {
	return a.date === b.date && a.startTime < b.endTime && b.startTime < a.endTime;
}

export function findOverlaps<T extends TimeSlot>(candidate: TimeSlot, others: readonly T[]): T[] {
	return others.filter((other) => overlaps(candidate, other));
}
