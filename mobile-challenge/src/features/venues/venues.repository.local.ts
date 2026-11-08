import venuesData from '@/data/venues.json';
import { AppError } from '@/shared/errors/app-error';
import { simulateLatency } from '@/shared/utils/simulate-latency';

import type { VenuesRepository } from './venues.repository';
import type { Venue, VenueSummary } from './venues.types';

// The JSON infers `number` for weekdays; its shape matches the API's full venue.
const venues = venuesData as Venue[];

// Only canonical positive integers ('1', '42'; not '01', '1.0' or '+1'), same as the API.
const CANONICAL_ID_PATTERN = /^[1-9]\d*$/;

function toVenueSummary({ id, name, address, location }: Venue): VenueSummary {
	return { id, name, address, location };
}

export const localVenuesRepository: VenuesRepository = {
	async listVenues() {
		await simulateLatency();
		return venues.map(toVenueSummary);
	},

	async getVenue(id) {
		await simulateLatency();

		const numericId = Number(id);
		const venue =
			CANONICAL_ID_PATTERN.test(id) && Number.isSafeInteger(numericId)
				? venues.find((candidate) => candidate.id === numericId)
				: undefined;

		if (!venue) {
			throw new AppError('VENUE_NOT_FOUND', 'Venue not found');
		}

		// A copy, so callers can't mutate the catalog.
		return structuredClone(venue);
	},
};
