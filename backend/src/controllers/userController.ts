import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { createUserSchema, updateUserSchema } from '../validators/schemas';

export class UserController {
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const users = await prisma.user.findMany({
        orderBy: { name: 'asc' },
      });
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const user = await prisma.user.findUnique({ where: { id } });

      if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const validation = createUserSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: 'Dados inválidos', details: validation.error.errors });
        return;
      }

      const { password, ...rest } = validation.data;
      const hashedPassword = bcrypt.hashSync(password, 10);

      const existingUser = await prisma.user.findUnique({ where: { email: rest.email } });
      if (existingUser) {
        res.status(409).json({ error: 'Email já cadastrado' });
        return;
      }

      const user = await prisma.user.create({
        data: {
          ...rest,
          password: hashedPassword,
        },
      });

      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const validation = updateUserSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({ error: 'Dados inválidos', details: validation.error.errors });
        return;
      }

      const user = await prisma.user.update({
        where: { id },
        data: validation.data,
      });

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      await prisma.user.delete({ where: { id } });
      res.json({ message: 'Usuário excluído com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao excluir usuário' });
    }
  }
}
