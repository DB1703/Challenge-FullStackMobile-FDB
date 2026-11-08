/** ISO 8601 weekday: 1 = Monday, 7 = Sunday (same as the API and date-fns `getISODay`). */
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** Opening hours of a venue for one weekday. Closed days have no entry. */
export type OpeningHours = {
	weekday: Weekday;
	/** `HH:MM` */
	opensAt: string;
	/** `HH:MM` */
	closesAt: string;
};

/** Bookable weekly occurrence of an activity (e.g. yoga, Monday 18:00). */
export type Session = {
	id: number;
	/** `HH:MM` */
	startTime: string;
	/** `HH:MM` */
	endTime: string;
};

/** Sessions of an activity on one weekday, sorted by `startTime`. Days without sessions are omitted. */
export type ScheduleDay = {
	weekday: Weekday;
	sessions: Session[];
};

export type Activity = {
	id: number;
	name: string;
	description: string;
	schedule: ScheduleDay[];
};

/** Venue as returned by the venue list. */
export type VenueSummary = {
	id: number;
	name: string;
	address: string;
	location: string;
};

/** Venue as returned by the venue detail. */
export type Venue = VenueSummary & {
	description: string;
	openingHours: OpeningHours[];
	activities: Activity[];
};
