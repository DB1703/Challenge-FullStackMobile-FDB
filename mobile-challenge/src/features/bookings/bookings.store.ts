import * as Crypto from 'expo-crypto';
import Storage from 'expo-sqlite/kv-store';
import { useMemo } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { useAuthStore } from '@/features/auth/auth.store';
import { simulateLatency } from '@/shared/utils/simulate-latency';

import { getAvailableDates, getSessionDateTime, isUpcoming } from './booking-rules';
import { BookingError } from './bookings.errors';
import type { BookableSession, Booking } from './bookings.types';

// Bookings are always local, also in api mode: the backend has no bookings. The store is the source,
// with the bookings of every user (filtered by the session's user), so they survive a logout.

type CreateBookingInput = {
	venueId: number;
	session: BookableSession;
	/** `YYYY-MM-DD` */
	date: string;
};

type BookingsState = {
	bookings: Booking[];
	isHydrated: boolean;
	createBooking: (input: CreateBookingInput) => Promise<Booking>;
	/** `startTime` of the booked session: only upcoming bookings can be cancelled. */
	cancelBooking: (bookingId: string, startTime: string) => Promise<void>;
};

function requireUserId(): number {
	const user = useAuthStore.getState().user;
	if (!user) {
		throw new BookingError('NOT_AUTHENTICATED', 'There is no active session');
	}
	return user.id;
}

export const useBookingsStore = create<BookingsState>()(
	persist(
		(set, get) => ({
			bookings: [],
			isHydrated: false,

			async createBooking({ venueId, session, date }) {
				// Same feedback as the other actions (loading button), although bookings are local.
				await simulateLatency();
				const userId = requireUserId();
				const now = new Date();

				if (getSessionDateTime(date, session.startTime) <= now) {
					throw new BookingError('SESSION_ALREADY_STARTED', 'The session has already started');
				}
				if (!getAvailableDates(session.weekday, session.startTime, now).includes(date)) {
					throw new BookingError('DATE_NOT_AVAILABLE', 'The date is not available for this session');
				}
				const isDuplicate = get().bookings.some(
					(booking) => booking.userId === userId && booking.sessionId === session.id && booking.date === date,
				);
				if (isDuplicate) {
					throw new BookingError('BOOKING_DUPLICATE', 'The session is already booked on that date');
				}

				const booking: Booking = { id: Crypto.randomUUID(), userId, venueId, sessionId: session.id, date };
				set((state) => ({ bookings: [...state.bookings, booking] }));
				return booking;
			},

			// No simulated latency: the confirmation dialog closes and the snackbar shows right away.
			async cancelBooking(bookingId, startTime) {
				const userId = requireUserId();
				const booking = get().bookings.find((candidate) => candidate.id === bookingId && candidate.userId === userId);

				if (!booking) {
					throw new BookingError('BOOKING_NOT_FOUND', 'Booking not found');
				}
				if (!isUpcoming(booking.date, startTime, new Date())) {
					throw new BookingError('BOOKING_NOT_CANCELLABLE', 'Only upcoming bookings can be cancelled');
				}

				set((state) => ({ bookings: state.bookings.filter((candidate) => candidate.id !== bookingId) }));
			},
		}),
		{
			name: 'bookings',
			version: 1,
			storage: createJSONStorage(() => Storage),
			partialize: (state) => ({ bookings: state.bookings }),
			// The storage is async, so this runs after `useBookingsStore` is assigned.
			onRehydrateStorage: () => (_state, error) => {
				if (error) {
					console.warn('Could not restore the saved bookings', error);
				}
				useBookingsStore.setState({ isHydrated: true });
			},
		},
	),
);

/** Bookings of the logged-in user. */
export function useUserBookings(): Booking[] {
	const bookings = useBookingsStore((state) => state.bookings);
	const userId = useAuthStore((state) => state.user?.id);

	return useMemo(() => bookings.filter((booking) => booking.userId === userId), [bookings, userId]);
}
