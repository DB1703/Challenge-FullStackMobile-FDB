import { env } from './config/env.js';
import { applySchema, isDatabaseEmpty } from './db/connection.js';
import app from './app.js';

applySchema();

if (isDatabaseEmpty()) {
	console.warn('Database is empty. Run "npm run db:seed" to load the initial data.');
}

app.listen(env.port, (error) => {
	if (error) {
		console.error(error);
		process.exit(1);
	}

	console.log(`Server listening on port ${env.port}`);
});
