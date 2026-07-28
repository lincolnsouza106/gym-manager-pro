import express from 'express';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { authRoutes } from './routes/authRoutes';
import { userRoutes } from './routes/userRoutes';
import { studentRoutes } from './routes/studentRoutes';
import { planRoutes } from './routes/planRoutes';
import { enrollmentRoutes } from './routes/enrollmentRoutes';
import { modalityRoutes } from './routes/modalityRoutes';
import { scheduleRoutes } from './routes/scheduleRoutes';
import { financeRoutes } from './routes/financeRoutes';
import { dashboardRoutes } from './routes/dashboardRoutes';

const app = express();
const PORT = process.env.PORT || 3001;

// [BUG_INTENCIONAL_ID_34] CORS allows all origins with * in production config
app.use(cors({ origin: '*' }));
app.use(express.json());

// Swagger configuration
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GymManager Pro API',
      version: '1.0.0',
      description: 'API de gerenciamento de academias - FitTech Solutions para Academia LifeFit',
      contact: {
        name: 'FitTech Solutions',
        email: 'suporte@fittechsolutions.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Servidor de Desenvolvimento',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/modalities', modalityRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// [BUG_INTENCIONAL_ID_46] Error handler returns stack trace in production
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    stack: err.stack,
  });
});

app.listen(PORT, () => {
  console.log(`🏋️ GymManager Pro API running on http://localhost:${PORT}`);
  console.log(`📚 Swagger docs: http://localhost:${PORT}/api-docs`);
});

export default app;
