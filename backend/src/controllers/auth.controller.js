import * as authService from '../services/auth.service.js';

export async function login(req, res) {
	const data = await authService.login(req.body);
	res.status(200).json({ data });
}
