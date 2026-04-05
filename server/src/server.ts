import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import { prisma } from './prisma.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3001);

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

function isLoopbackOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin);
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
  } catch {
    return false;
  }
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

// Middlewares
app.use(helmet());
app.use(express.json());
app.use(apiLimiter);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || isLoopbackOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origem nao permitida pelo CORS'));
    },
    credentials: true,
  })
);

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'VeloTech server is running' });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});
