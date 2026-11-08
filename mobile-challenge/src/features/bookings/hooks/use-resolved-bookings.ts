import { useMemo } from 'react';

import { getVenueCached } from '@/features/venues/venue-cache';
import type { Venue } from '@/features/venues/venues.types';
import { isAppError } from '@/shared/errors/app-error';
import { useAsync } from '@/shared/hooks/use-async';

import { indexVenueSessions } from '../booking-details';
import { getSessionDateTime } from '../booking-rules';
import { useUserBookings } from '../bookings.store';
import type { ResolvedBooking } from '../bookings.types';

// A venue that no longer exists leaves its bookings unresolved instead of failing the whole list.
async function loadVenue(id: number): Promise<Venue | null> {
	try {
		return await getVenueCached(String(id));
	} catch (error) {
		if (isAppError(error, 'VENUE_NOT_FOUND')) {
			return null;
		}
		throw error;
	}
}

/**
 * Joins the user's bookings with the catalog. Only the venues that have bookings are loaded
 * (unique ids, in parallel, through the shared cache). New or cancelled bookings update right away:
 * the venues are only reloaded when the set of venue ids changes.
 * `now` splits upcoming (until the session starts) and past bookings.
 */
export function useResolvedBookings(now: Date) {
	const bookings = useUserBookings();

	const venueIds = useMemo(
		() => [...new Set(bookings.map((booking) => booking.venueId))].sort((a, b) => a - b),
		[bookings],
	);
	const venueIdsKey = venueIds.join(',');

	const venues = useAsync(() => Promise.all(venueIds.map(loadVenue)), [venueIdsKey]);
	const venuesData = venues.status === 'success' ? venues.data : null;

	const resolved = useMemo(() => {
		if (!venuesData) {
			return null;
		}

		const index = indexVenueSessions(venuesData);
		const all: ResolvedBooking[] = bookings.map((booking) => {
			const details = index.get(booking.sessionId) ?? null;
			// Without catalog data the time is unknown: the booking counts as upcoming until the end of its day.
			const startTime = details?.session.startTime ?? '23:59';
			const endTime = details?.session.endTime ?? '23:59';
			return {
				...booking,
				details,
				startsAt: getSessionDateTime(booking.date, startTime),
				endsAt: getSessionDateTime(booking.date, endTime),
			};
		});

		return {
			upcoming: all
				.filter((booking) => booking.startsAt > now)
				.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime()),
			past: all
				.filter((booking) => booking.startsAt <= now)
				.sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime()),
		};
	}, [venuesData, bookings, now]);

	return {
		status: venues.status,
		retry: venues.retry,
		total: bookings.length,
		upcoming: resolved?.upcoming ?? [],
		past: resolved?.past ?? [],
	};
}
