import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/prisma.js';
import authRoutes from './routes/auth.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'joineazy-backend' });
});

app.use('/api/auth', authRoutes);

// Further route groups will be mounted here as they're built, e.g.:
// import groupRoutes from './routes/group.routes.js';
// app.use('/api/groups', groupRoutes);

app.listen(PORT, async () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  await testConnection();
});
