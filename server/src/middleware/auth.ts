import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: number;
  userEmail?: string;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET nao configurado no ambiente');
  }

  return secret;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token nao fornecido' });
    return;
  }

  const token = authHeader.slice('Bearer '.length).trim();

  if (!token) {
    res.status(401).json({ error: 'Token nao fornecido' });
    return;
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as {
      id: number;
      email: string;
    };
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    next();
  } catch {
    res.status(401).json({ error: 'Token invalido' });
  }
}
