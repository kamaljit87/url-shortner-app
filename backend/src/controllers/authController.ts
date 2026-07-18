import { Request, Response } from 'express';
import * as authService from '../services/authService';

export async function register(req: Request, res: Response) {
  const result = await authService.registerUser(req.body);
  res.status(201).json(result);
}

export async function login(req: Request, res: Response) {
  const result = await authService.loginUser(req.body);
  res.status(200).json(result);
}

export async function logout(_req: Request, res: Response) {
  // JWTs are stateless; logout is handled client-side by discarding the token.
  res.status(200).json({ message: 'Logged out successfully' });
}
