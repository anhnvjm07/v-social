import express, { Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './shared/config/swagger';
import { errorHandler, notFoundHandler } from './shared/middleware/error.middleware';

// Routes
import authRoutes from './modules/auth/routes/auth.routes';
import postsRoutes from './modules/posts/routes/posts.routes';
import commentsRoutes from './modules/comments/routes/comments.routes';
import reactionsRoutes from './modules/reactions/routes/reactions.routes';
import followsRoutes from './modules/follows/routes/follows.routes';
import messagesRoutes from './modules/messages/routes/messages.routes';
import notificationsRoutes from './modules/notifications/routes/notifications.routes';

const app: Express = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/reactions', reactionsRoutes);
app.use('/api/follows', followsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/notifications', notificationsRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

