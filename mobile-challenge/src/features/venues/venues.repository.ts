import { selectImplementation } from '@/shared/config/select-implementation';

import { localVenuesRepository } from './venues.repository.local';
import type { Venue, VenueSummary } from './venues.types';

export interface VenuesRepository {
	listVenues(): Promise<VenueSummary[]>;
	/** `id` as it appears in the route; throws `VENUE_NOT_FOUND` if it doesn't match a venue. */
	getVenue(id: string): Promise<Venue>;
}

export const venuesRepository = selectImplementation<VenuesRepository>({
	local: localVenuesRepository,
});
