import { applySchema, db } from './connection.js';
import { hashPassword } from '../utils/password.js';

const users = [
	{
		id: 1,
		email: 'usuario.prueba@example.com',
		password: 'Prueba123!',
		firstName: 'Lucía',
		lastName: 'Fernández',
		birthDate: '1995-04-12',
		address: 'Av. Corrientes 1234, CABA',
	},
];

const venues = [
	{
		id: 1,
		name: 'Sede Palermo',
		address: 'Av. Santa Fe 3500, CABA',
		location: 'Palermo, a dos cuadras de Plaza Italia',
		description: 'Sede con sala de yoga y área de entrenamiento funcional, vestuarios y duchas.',
		// Closed on Sundays: no row for weekday 7.
		openingHours: [
			{ weekday: 1, opensAt: '07:00', closesAt: '23:00' },
			{ weekday: 2, opensAt: '07:00', closesAt: '23:00' },
			{ weekday: 3, opensAt: '07:00', closesAt: '23:00' },
			{ weekday: 4, opensAt: '07:00', closesAt: '23:00' },
			{ weekday: 5, opensAt: '07:00', closesAt: '23:00' },
			{ weekday: 6, opensAt: '09:00', closesAt: '20:00' },
		],
	},
	{
		id: 2,
		name: 'Sede Belgrano',
		address: 'Av. Cabildo 2100, CABA',
		location: 'Belgrano, frente a la estación Juramento de la línea D',
		description: 'Sede con sala de spinning y estudio de pilates con reformers.',
		openingHours: [
			{ weekday: 1, opensAt: '08:00', closesAt: '22:00' },
			{ weekday: 2, opensAt: '08:00', closesAt: '22:00' },
			{ weekday: 3, opensAt: '08:00', closesAt: '22:00' },
			{ weekday: 4, opensAt: '08:00', closesAt: '22:00' },
			{ weekday: 5, opensAt: '08:00', closesAt: '22:00' },
			{ weekday: 6, opensAt: '09:00', closesAt: '14:00' },
			{ weekday: 7, opensAt: '09:00', closesAt: '13:00' },
		],
	},
];

const activities = [
	{
		id: 1,
		venueId: 1,
		name: 'Yoga',
		description: 'Clase de yoga hatha para todos los niveles, con foco en respiración y flexibilidad.',
		sessions: [
			{ id: 1, weekday: 1, startTime: '08:00', endTime: '09:00' },
			{ id: 2, weekday: 1, startTime: '19:00', endTime: '20:00' },
			{ id: 3, weekday: 3, startTime: '08:00', endTime: '09:00' },
			{ id: 4, weekday: 3, startTime: '19:00', endTime: '20:00' },
			{ id: 5, weekday: 6, startTime: '10:00', endTime: '11:00' },
		],
	},
	{
		id: 2,
		venueId: 1,
		name: 'Entrenamiento funcional',
		description: 'Circuito de fuerza y resistencia con peso corporal y elementos.',
		sessions: [
			{ id: 6, weekday: 2, startTime: '07:30', endTime: '08:30' },
			{ id: 7, weekday: 2, startTime: '18:00', endTime: '19:00' },
			{ id: 8, weekday: 4, startTime: '07:30', endTime: '08:30' },
			{ id: 9, weekday: 4, startTime: '18:00', endTime: '19:00' },
			{ id: 10, weekday: 4, startTime: '20:00', endTime: '21:00' },
		],
	},
	{
		id: 3,
		venueId: 2,
		name: 'Spinning',
		description: 'Clase de ciclismo indoor de alta intensidad con música.',
		sessions: [
			{ id: 11, weekday: 1, startTime: '08:30', endTime: '09:15' },
			{ id: 12, weekday: 1, startTime: '19:00', endTime: '19:45' },
			{ id: 13, weekday: 3, startTime: '19:00', endTime: '19:45' },
			{ id: 14, weekday: 5, startTime: '08:30', endTime: '09:15' },
			{ id: 15, weekday: 5, startTime: '19:00', endTime: '19:45' },
			{ id: 16, weekday: 6, startTime: '10:00', endTime: '10:45' },
		],
	},
	{
		id: 4,
		venueId: 2,
		name: 'Pilates reformer',
		description: 'Clase de pilates en reformer, grupos reducidos.',
		sessions: [
			{ id: 17, weekday: 2, startTime: '09:00', endTime: '10:00' },
			{ id: 18, weekday: 2, startTime: '18:30', endTime: '19:30' },
			{ id: 19, weekday: 4, startTime: '18:30', endTime: '19:30' },
			{ id: 20, weekday: 7, startTime: '10:00', endTime: '11:00' },
		],
	},
];

const insertUser = db.prepare(`
	INSERT OR IGNORE INTO users (id, email, password_hash, first_name, last_name, birth_date, address)
	VALUES (?, ?, ?, ?, ?, ?, ?)
`);
const insertVenue = db.prepare(`
	INSERT OR IGNORE INTO venues (id, name, address, location, description)
	VALUES (?, ?, ?, ?, ?)
`);
const insertOpeningHours = db.prepare(`
	INSERT OR IGNORE INTO venue_opening_hours (venue_id, weekday, opens_at, closes_at)
	VALUES (?, ?, ?, ?)
`);
const insertActivity = db.prepare(`
	INSERT OR IGNORE INTO activities (id, venue_id, name, description)
	VALUES (?, ?, ?, ?)
`);
const insertSession = db.prepare(`
	INSERT OR IGNORE INTO sessions (id, activity_id, weekday, start_time, end_time)
	VALUES (?, ?, ?, ?, ?)
`);

// Hashing is async, so it happens before the synchronous transaction.
const preparedUsers = await Promise.all(
	users.map(async (user) => ({
		...user,
		email: user.email.trim().toLowerCase(),
		passwordHash: await hashPassword(user.password),
		address: user.address?.trim() || null,
	})),
);

const inserted = { users: 0, venues: 0, openingHours: 0, activities: 0, sessions: 0 };

applySchema();

db.exec('BEGIN');
try {
	for (const user of preparedUsers) {
		inserted.users += insertUser.run(
			user.id, user.email, user.passwordHash, user.firstName, user.lastName, user.birthDate, user.address,
		).changes;
	}

	for (const venue of venues) {
		inserted.venues += insertVenue.run(venue.id, venue.name, venue.address, venue.location, venue.description).changes;
		for (const hours of venue.openingHours) {
			inserted.openingHours += insertOpeningHours.run(venue.id, hours.weekday, hours.opensAt, hours.closesAt).changes;
		}
	}

	for (const activity of activities) {
		inserted.activities += insertActivity.run(activity.id, activity.venueId, activity.name, activity.description).changes;
		for (const session of activity.sessions) {
			inserted.sessions += insertSession.run(
				session.id, activity.id, session.weekday, session.startTime, session.endTime,
			).changes;
		}
	}

	db.exec('COMMIT');
} catch (error) {
	db.exec('ROLLBACK');
	console.error('Seed failed, no changes were applied.');
	console.error(error);
	process.exit(1);
}

console.log('Seed completed. Rows inserted:', inserted);
