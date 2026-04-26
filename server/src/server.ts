import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { ZodError } from 'zod';
import authRoutes from './routes/authRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import productsRoutes from './routes/productsRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import ordersRoutes from './routes/ordersRoutes.js';
import engagementRoutes from './routes/engagementRoutes.js';
import { prisma } from './prisma.js';
import { ensureCatalogSeeded } from './services/catalogService.js';

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
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api', engagementRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'VeloTech server is running' });
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: 'Dados invalidos',
      details: error.errors.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  if (error instanceof Error && error.name === 'FinalizacaoCompraError') {
    res.status(400).json({ error: error.message });
    return;
  }

  console.error('Erro nao tratado na API:', error);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Iniciar servidor
let server: ReturnType<typeof app.listen>;

async function bootstrap() {
  await ensureCatalogSeeded();
  server = app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  });
}

bootstrap().catch(async (error) => {
  console.error('Falha ao iniciar servidor:', error);
  await prisma.$disconnect();
  process.exit(1);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  server?.close(() => process.exit(0));
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  server?.close(() => process.exit(0));
});
