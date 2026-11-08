import type { Activity, ScheduleDay, Session, VenueSummary } from '@/features/venues/venues.types';

/**
 * A booking of one concrete date of a session. Only references are stored; what is shown
 * (venue, activity, time) comes from the catalog. `venueId` lets the app load only the venues it needs.
 */
export type Booking = {
	/** UUID (expo-crypto). */
	id: string;
	userId: number;
	venueId: number;
	sessionId: number;
	/** `YYYY-MM-DD` */
	date: string;
};

/** The session data the booking rules need. */
export type BookableSession = Pick<Session, 'id' | 'startTime' | 'endTime'> & Pick<ScheduleDay, 'weekday'>;

/** Catalog data of a booking. */
export type BookingDetails = {
	venue: VenueSummary;
	activity: Pick<Activity, 'id' | 'name'>;
	session: BookableSession;
};

/** A booking joined with its catalog data, ready to display. */
export type ResolvedBooking = Booking & {
	/** `null` if the session is no longer in the catalog. */
	details: BookingDetails | null;
	startsAt: Date;
	endsAt: Date;
};
