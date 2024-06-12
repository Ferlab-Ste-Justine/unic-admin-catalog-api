import cors from 'cors';
import express, { Express } from 'express';
import helmet from 'helmet';
import { pino } from 'pino';

import { analystRouter } from '@/api/analyst/analystRouter';
import { dictionaryRouter } from '@/api/dictionary/dictionaryRouter';
import { dictTableRouter } from '@/api/dictTable/dictTableRouter';
import { healthCheckRouter } from '@/api/healthCheck/healthCheckRouter';
import { resourceRouter } from '@/api/resource/resourceRouter';
import { userRouter } from '@/api/user/userRouter';
import { valueSetRouter } from '@/api/valueSet/valueSetRouter';
import { variableRouter } from '@/api/variable/variableRouter';
import { openAPIRouter } from '@/api-docs/openAPIRouter';
import errorHandler from '@/common/middleware/errorHandler';
import rateLimiter from '@/common/middleware/rateLimiter';
import requestLogger from '@/common/middleware/requestLogger';
import { env } from '@/common/utils/envConfig';

const logger = pino({ name: 'server start' });
const app: Express = express();

app.use(express.json());
// Set the application to trust the reverse proxy
app.set('trust proxy', true);

// Middlewares
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(rateLimiter);

// Request logging
app.use(requestLogger);

// Routes
app.use('/health-check', healthCheckRouter);
app.use('/users', userRouter);
app.use('/analysts', analystRouter);
app.use('/resources', resourceRouter);
app.use('/value-sets', valueSetRouter);
app.use('/dictionaries', dictionaryRouter);
app.use('/dict-tables', dictTableRouter);
app.use('/variables', variableRouter);

// Swagger UI
app.use(openAPIRouter);

// Error handlers
app.use(errorHandler());

export { app, logger };
