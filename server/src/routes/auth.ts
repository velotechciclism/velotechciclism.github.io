import { z } from 'zod';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db/connection.js';

// Schemas de validação
export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
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
  user: Omit<User, 'password'>;
  token: string;
}

// Funções
export async function registerUser(data: RegisterData): Promise<AuthResponse> {
  const hashedPassword = await bcryptjs.hash(data.password, 10);

  const result = await pool.query(
    `INSERT INTO users (email, name, password, phone, address) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING id, email, name, phone, address, created_at`,
    [data.email, data.name, hashedPassword, data.phone || null, data.address || null]
  );

  const user = result.rows[0];
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  return { user, token };
}

export async function loginUser(data: LoginData): Promise<AuthResponse> {
  const result = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [data.email]
  );

  if (result.rows.length === 0) {
    throw new Error('Email ou senha inválidos');
  }

  const user = result.rows[0];
  const isPasswordValid = await bcryptjs.compare(data.password, user.password);

  if (!isPasswordValid) {
    throw new Error('Email ou senha inválidos');
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const { password, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
}

export async function getUserById(id: number): Promise<User | null> {
  const result = await pool.query(
    `SELECT id, email, name, phone, address, created_at FROM users WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
}
