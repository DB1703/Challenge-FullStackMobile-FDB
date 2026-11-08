import { useAsync } from '@/shared/hooks/use-async';

import { venuesRepository } from '../venues.repository';

export function useVenues() {
	return useAsync(() => venuesRepository.listVenues(), []);
}
