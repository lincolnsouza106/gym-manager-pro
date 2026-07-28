import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { createModalitySchema, updateModalitySchema } from '../validators/schemas';

export class ModalityController {
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const modalities = await prisma.modality.findMany({
        orderBy: { name: 'asc' },
        include: {
          schedules: {
            include: {
              instructor: { select: { id: true, name: true, email: true } },
              _count: { select: { checkins: true } },
            },
          },
        },
      });
      res.json(modalities);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar modalidades' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const modality = await prisma.modality.findUnique({
        where: { id },
        include: {
          schedules: {
            include: {
              instructor: { select: { id: true, name: true } },
              checkins: { include: { student: true } },
            },
          },
        },
      });

      if (!modality) {
        res.status(404).json({ error: 'Modalidade não encontrada' });
        return;
      }

      res.json(modality);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar modalidade' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const validation = createModalitySchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: 'Dados inválidos', details: validation.error.errors });
        return;
      }

      const modality = await prisma.modality.create({
        data: validation.data,
      });

      res.status(201).json(modality);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar modalidade' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const validation = updateModalitySchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({ error: 'Dados inválidos', details: validation.error.errors });
        return;
      }

      const modality = await prisma.modality.update({
        where: { id },
        data: validation.data,
      });

      res.json(modality);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar modalidade' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      await prisma.classSchedule.deleteMany({ where: { modalityId: id } });
      await prisma.modality.delete({ where: { id } });

      res.json({ message: 'Modalidade excluída com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao excluir modalidade' });
    }
  }
}
