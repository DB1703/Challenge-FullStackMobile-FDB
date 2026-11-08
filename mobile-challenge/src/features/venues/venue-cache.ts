import { venuesRepository } from './venues.repository';
import type { Venue } from './venues.types';

// In-memory cache of full venues, shared by the venue detail, the booking modal and the home bookings,
// so each venue is loaded once. The catalog is static, so entries live for the whole app run.
// The promise is cached (concurrent loads are deduplicated); rejections are not, so a retry loads again.
const cache = new Map<string, Promise<Venue>>();

export function getVenueCached(id: string): Promise<Venue> {
	const cached = cache.get(id);
	if (cached) {
		return cached;
	}

	const request = venuesRepository.getVenue(id);
	cache.set(id, request);
	request.catch(() => cache.delete(id));
	return request;
}
