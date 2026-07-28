import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { loginSchema } from '../validators/schemas';
import { JWT_SECRET } from '../middleware/auth';

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: 'Dados inválidos', details: validation.error.errors });
        return;
      }

      const { email, password } = validation.data;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        res.status(401).json({ error: 'Credenciais inválidas' });
        return;
      }

      const passwordValid = bcrypt.compareSync(password, user.password);
      if (!passwordValid) {
        res.status(401).json({ error: 'Credenciais inválidas' });
        return;
      }

      // [BUG_INTENCIONAL_ID_12] JWT token never expires - no expiresIn option
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET
      );

      // [BUG_INTENCIONAL_ID_26] Login returns full user object including password hash
      res.json({
        token,
        user: user,
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ error: 'Email é obrigatório' });
        return;
      }

      const user = await prisma.user.findUnique({ where: { email } });

      // Always return success (mock - doesn't actually send email)
      res.json({
        message: 'Se o email existir em nosso sistema, você receberá instruções de recuperação.',
        success: true,
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}
