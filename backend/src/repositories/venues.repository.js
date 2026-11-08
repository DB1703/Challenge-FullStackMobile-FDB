import { db } from '../db/connection.js';

const findAllStatement = db.prepare('SELECT id, name, address, location FROM venues ORDER BY id');
const findByIdStatement = db.prepare('SELECT id, name, address, location, description FROM venues WHERE id = ?');
const findOpeningHoursStatement = db.prepare(`
	SELECT weekday, opens_at, closes_at
	FROM venue_opening_hours
	WHERE venue_id = ?
	ORDER BY weekday
`);
const findActivitiesStatement = db.prepare(`
	SELECT id, name, description
	FROM activities
	WHERE venue_id = ?
	ORDER BY id
`);
// 'HH:MM' values are zero-padded, so ordering them as text matches chronological order.
const findSessionsStatement = db.prepare(`
	SELECT s.id, s.activity_id, s.weekday, s.start_time, s.end_time
	FROM sessions s
	JOIN activities a ON a.id = s.activity_id
	WHERE a.venue_id = ?
	ORDER BY s.activity_id, s.weekday, s.start_time
`);

function toVenueSummary(row) {
	return { id: row.id, name: row.name, address: row.address, location: row.location };
}

// Groups sessions (already sorted by activity, weekday and start time) into a schedule per activity.
// Days without sessions produce no group.
function buildSchedules(sessionRows) {
	const schedules = new Map();

	for (const row of sessionRows) {
		if (!schedules.has(row.activity_id)) {
			schedules.set(row.activity_id, []);
		}
		const schedule = schedules.get(row.activity_id);

		let day = schedule.at(-1);
		if (day?.weekday !== row.weekday) {
			day = { weekday: row.weekday, sessions: [] };
			schedule.push(day);
		}
		day.sessions.push({ id: row.id, startTime: row.start_time, endTime: row.end_time });
	}

	return schedules;
}

export function findAll() {
	return findAllStatement.all().map(toVenueSummary);
}

// Builds the full venue with a fixed number of queries, regardless of how many activities it has.
export function findById(id) {
	const venueRow = findByIdStatement.get(id);
	if (!venueRow) {
		return null;
	}

	const openingHours = findOpeningHoursStatement.all(id).map((row) => ({
		weekday: row.weekday,
		opensAt: row.opens_at,
		closesAt: row.closes_at,
	}));

	const schedules = buildSchedules(findSessionsStatement.all(id));
	const activities = findActivitiesStatement.all(id).map((row) => ({
		id: row.id,
		name: row.name,
		description: row.description,
		schedule: schedules.get(row.id) ?? [],
	}));

	return {
		...toVenueSummary(venueRow),
		description: venueRow.description,
		openingHours,
		activities,
	};
}
