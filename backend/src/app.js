import express from 'express';
import { healthRoutes } from './routes/health.routes.js';
import { notFound } from './middlewares/not-found.js';
import { errorHandler } from './middlewares/error-handler.js';

const app = express();

app.disable('x-powered-by');
app.use(express.json());

app.use('/health', healthRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
