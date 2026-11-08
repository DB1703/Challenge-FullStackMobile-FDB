import { useAsync } from '@/shared/hooks/use-async';

import { getVenueCached } from '../venue-cache';

/** `id` as it comes from the route; an unknown id ends in the `VENUE_NOT_FOUND` error. */
export function useVenue(id: string) {
	return useAsync(() => getVenueCached(id), [id]);
}
