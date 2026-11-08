import { env } from './config/env.js';
import app from './app.js';

app.listen(env.port, (error) => {
	if (error) {
		console.error(error);
		process.exit(1);
	}

	console.log(`Server listening on port ${env.port}`);
});
