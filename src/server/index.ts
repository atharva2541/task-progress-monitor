
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import bodyParser from 'body-parser';
import { config } from 'dotenv';

// Import route handlers
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import taskRoutes from './routes/tasks';
import awsRoutes from './routes/aws';
import logsRoutes from './routes/logs';
import notificationRoutes from './routes/notifications';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/aws', awsRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Create HTTP server
const server = createServer(app);

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default server;
