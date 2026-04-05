import express, { Request, Response } from 'express';
import * as authService from './auth.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Registro
router.post('/register', async (req: Request, res: Response) => {
  try {
    const data = authService.registerSchema.parse(req.body);
    const result = await authService.registerUser(data);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'Erro ao registrar usuário' });
    }
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const data = authService.loginSchema.parse(req.body);
    const result = await authService.loginUser(data);
    res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({ error: error.message });
    } else {
      res.status(401).json({ error: 'Erro ao fazer login' });
    }
  }
});

// Obter perfil do usuário
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Usuário não identificado' });
    }

    const user = await authService.getUserById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

export default router;
