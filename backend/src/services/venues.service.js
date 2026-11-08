import { NotFoundError } from '../errors/index.js';
import * as venuesRepository from '../repositories/venues.repository.js';

// Only canonical positive integers ('1', '42'; not '01', '1.0' or '+1'), so each venue has a single URL.
const CANONICAL_ID_PATTERN = /^[1-9]\d*$/;

function venueNotFound() {
	return new NotFoundError('VENUE_NOT_FOUND', 'Venue not found');
}

export function listVenues() {
	return venuesRepository.findAll();
}

export function getVenue(rawId) {
	const id = Number(rawId);
	if (!CANONICAL_ID_PATTERN.test(rawId) || !Number.isSafeInteger(id)) {
		throw venueNotFound();
	}

	const venue = venuesRepository.findById(id);
	if (!venue) {
		throw venueNotFound();
	}

	return venue;
}
