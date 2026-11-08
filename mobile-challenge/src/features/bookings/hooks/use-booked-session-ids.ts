import { useMemo } from 'react';

import type { Venue } from '@/features/venues/venues.types';
import { useNow } from '@/shared/hooks/use-now';

import { indexVenueSessions } from '../booking-details';
import { isUpcoming } from '../booking-rules';
import { useUserBookings } from '../bookings.store';

/** Sessions of the venue with at least one upcoming booking of the user (for the venue detail). */
export function useBookedSessionIds(venue: Venue | null): ReadonlySet<number> {
	const bookings = useUserBookings();
	const now = useNow();

	return useMemo(() => {
		if (!venue) return new Set<number>();
		const index = indexVenueSessions([venue]);

		return new Set(
			bookings
				.filter((booking) => {
					const details = booking.venueId === venue.id ? index.get(booking.sessionId) : undefined;
					return details !== undefined && isUpcoming(booking.date, details.session.startTime, now);
				})
				.map((booking) => booking.sessionId),
		);
	}, [venue, bookings, now]);
}
