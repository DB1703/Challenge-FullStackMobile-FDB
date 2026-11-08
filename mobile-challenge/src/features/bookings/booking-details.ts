import type { Venue } from '@/features/venues/venues.types';

import type { BookingDetails } from './bookings.types';

/** Index `sessionId → { venue, activity, session }` of the given venues (null entries are skipped). */
export function indexVenueSessions(venues: readonly (Venue | null)[]): Map<number, BookingDetails> {
	const index = new Map<number, BookingDetails>();

	for (const venue of venues) {
		if (!venue) continue;
		const summary = { id: venue.id, name: venue.name, address: venue.address, location: venue.location };

		for (const activity of venue.activities) {
			for (const day of activity.schedule) {
				for (const session of day.sessions) {
					index.set(session.id, {
						venue: summary,
						activity: { id: activity.id, name: activity.name },
						session: { ...session, weekday: day.weekday },
					});
				}
			}
		}
	}

	return index;
}
