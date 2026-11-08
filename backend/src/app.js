import express from 'express';
import swaggerUi from 'swagger-ui-express';
import openapi from '../openapi.json' with { type: 'json' };
import { apiRoutes } from './routes/api.routes.js';
import { healthRoutes } from './routes/health.routes.js';
import { notFound } from './middlewares/not-found.js';
import { errorHandler } from './middlewares/error-handler.js';

const app = express();

app.disable('x-powered-by');
app.use(express.json());

app.use('/health', healthRoutes);
app.use('/api/v1', apiRoutes);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));

app.use(notFound);
app.use(errorHandler);

export default app;
