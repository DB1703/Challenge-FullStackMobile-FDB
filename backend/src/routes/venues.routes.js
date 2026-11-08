import { Router } from 'express';
import { getVenue, listVenues } from '../controllers/venues.controller.js';

// Public catalog: no authentication.
export const venuesRoutes = Router();

venuesRoutes.get('/', listVenues);
venuesRoutes.get('/:id', getVenue);
