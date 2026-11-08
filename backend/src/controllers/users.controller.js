import * as usersService from '../services/users.service.js';

export function getMe(req, res) {
	const data = usersService.getProfile(req.user.id);
	res.status(200).json({ data });
}

export function updateMe(req, res) {
	const data = usersService.updateProfile(req.user.id, req.body);
	res.status(200).json({ data });
}
