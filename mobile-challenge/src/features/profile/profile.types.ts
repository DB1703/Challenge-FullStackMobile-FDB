import type { z } from 'zod';

import type { updateProfileSchema } from './profile.schemas';

export type User = {
	id: number;
	email: string;
	firstName: string;
	lastName: string;
	/** ISO 8601 date: `YYYY-MM-DD` */
	birthDate: string;
	address: string | null;
};

/** Body of a profile update, before normalization. */
export type UpdateProfileInput = z.input<typeof updateProfileSchema>;
