import { z } from 'zod';

// Fields shared by several resources, so their rules are defined in a single place.

// Normalized before validating, so surrounding spaces or uppercase letters are accepted.
export const emailSchema = z.string().trim().toLowerCase().pipe(z.email());
