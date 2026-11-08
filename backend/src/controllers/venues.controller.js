import * as venuesService from '../services/venues.service.js';

export function listVenues(req, res) {
	const data = venuesService.listVenues();
	res.status(200).json({ data });
}

export function getVenue(req, res) {
	const data = venuesService.getVenue(req.params.id);
	res.status(200).json({ data });
}
