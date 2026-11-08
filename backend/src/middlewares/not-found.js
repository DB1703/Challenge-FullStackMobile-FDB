import { NotFoundError } from '../errors/index.js';

export function notFound(req, res, next) {
	next(new NotFoundError('ROUTE_NOT_FOUND', 'Route not found'));
}
