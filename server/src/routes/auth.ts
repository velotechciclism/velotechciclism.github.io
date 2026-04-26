import { z } from 'zod';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';

// Schemas de validação
export const registerSchema = z.object({
  email: z.string().email('E-mail inválido'),
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

// Types
export type RegisterData = z.infer<typeof registerSchema>;
export type LoginData = z.infer<typeof loginSchema>;

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  created_at: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET nao configurado no ambiente');
  }

  return secret;
}

// Funções
export async function registerUser(data: RegisterData): Promise<AuthResponse> {
  const hashedPassword = await bcryptjs.hash(data.password, 10);

  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });

  if (existingUser) {
    throw new Error('E-mail ja cadastrado');
  }

  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: hashedPassword,
      phone: data.phone,
      address: data.address,
    },
  });

  const tokenExpiresIn = (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];
  const token = jwt.sign(
    { id: user.id, email: user.email },
    getJwtSecret(),
    { expiresIn: tokenExpiresIn }
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone || undefined,
      address: user.address || undefined,
      created_at: user.createdAt,
    },
    token,
  };
}

export async function loginUser(data: LoginData): Promise<AuthResponse> {
  const user = await prisma.user.findUnique({ where: { email: data.email } });

  if (!user) {
    throw new Error('E-mail ou senha inválidos');
  }

  const isPasswordValid = await bcryptjs.compare(data.password, user.password);

  if (!isPasswordValid) {
    throw new Error('E-mail ou senha inválidos');
  }

  const tokenExpiresIn = (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];
  const token = jwt.sign(
    { id: user.id, email: user.email },
    getJwtSecret(),
    { expiresIn: tokenExpiresIn }
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone || undefined,
      address: user.address || undefined,
      created_at: user.createdAt,
    },
    token,
  };
}

export async function getUserById(id: number): Promise<User | null> {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone || undefined,
    address: user.address || undefined,
    created_at: user.createdAt,
  };
}
