import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { createPlanSchema, updatePlanSchema } from '../validators/schemas';

export class PlanController {
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const plans = await prisma.plan.findMany({
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { enrollments: true } },
        },
      });
      res.json(plans);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar planos' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const plan = await prisma.plan.findUnique({
        where: { id },
        include: {
          enrollments: {
            include: { student: true },
          },
        },
      });

      if (!plan) {
        res.status(404).json({ error: 'Plano não encontrado' });
        return;
      }

      res.json(plan);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar plano' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      // [BUG_INTENCIONAL_ID_28] Price accepts negative values (from Zod schema)
      // [BUG_INTENCIONAL_ID_38] Duration accepts 0 months (from Zod schema)
      const validation = createPlanSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: 'Dados inválidos', details: validation.error.errors });
        return;
      }

      const plan = await prisma.plan.create({
        data: validation.data,
      });

      res.status(201).json(plan);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar plano' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const validation = updatePlanSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({ error: 'Dados inválidos', details: validation.error.errors });
        return;
      }

      const plan = await prisma.plan.update({
        where: { id },
        data: validation.data,
      });

      res.json(plan);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar plano' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      // [BUG_INTENCIONAL_ID_14] Deleting plan doesn't check for active enrollments
      await prisma.plan.delete({ where: { id } });
      res.json({ message: 'Plano excluído com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao excluir plano' });
    }
  }
}
