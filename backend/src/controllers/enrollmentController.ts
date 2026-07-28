import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { createEnrollmentSchema } from '../validators/schemas';

export class EnrollmentController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const status = req.query.status as string;
      const studentId = req.query.studentId ? parseInt(req.query.studentId as string) : undefined;

      const where: any = {};
      if (status) where.status = status;
      if (studentId) where.studentId = studentId;

      const enrollments = await prisma.enrollment.findMany({
        where,
        include: {
          student: true,
          plan: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json(enrollments);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar matrículas' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const enrollment = await prisma.enrollment.findUnique({
        where: { id },
        include: {
          student: true,
          plan: true,
          invoices: { orderBy: { dueDate: 'desc' } },
        },
      });

      if (!enrollment) {
        res.status(404).json({ error: 'Matrícula não encontrada' });
        return;
      }

      res.json(enrollment);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar matrícula' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const validation = createEnrollmentSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: 'Dados inválidos', details: validation.error.errors });
        return;
      }

      const { studentId, planId, startDate } = validation.data;

      const plan = await prisma.plan.findUnique({ where: { id: planId } });
      if (!plan) {
        res.status(404).json({ error: 'Plano não encontrado' });
        return;
      }

      // [BUG_INTENCIONAL_ID_49] Start date defaults to server time, not client timezone
      const start = startDate ? new Date(startDate) : new Date();
      const end = new Date(start);

      // [BUG_INTENCIONAL_ID_16] Trimestral plan adds 4 months instead of 3
      if (plan.durationMonths === 3) {
        end.setMonth(end.getMonth() + 4);
      } else {
        end.setMonth(end.getMonth() + plan.durationMonths);
      }

      const enrollment = await prisma.enrollment.create({
        data: {
          studentId,
          planId,
          startDate: start,
          endDate: end,
          status: 'ACTIVE',
        },
        include: {
          student: true,
          plan: true,
        },
      });

      // Generate invoices for the enrollment
      const monthlyAmount = plan.price / plan.durationMonths;
      for (let i = 0; i < plan.durationMonths; i++) {
        const dueDate = new Date(start);
        dueDate.setMonth(dueDate.getMonth() + i);
        // [BUG_INTENCIONAL_ID_11] Due date off by 1 day (UTC issue)
        dueDate.setDate(9);

        await prisma.invoice.create({
          data: {
            enrollmentId: enrollment.id,
            studentId,
            amount: monthlyAmount,
            discount: 0,
            finalAmount: monthlyAmount,
            dueDate,
            status: 'PENDING',
          },
        });
      }

      res.status(201).json(enrollment);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar matrícula' });
    }
  }

  async cancel(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      // [BUG_INTENCIONAL_ID_32] Cancel enrollment doesn't generate pro-rata refund note
      const enrollment = await prisma.enrollment.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: { student: true, plan: true },
      });

      // Cancel pending invoices
      await prisma.invoice.updateMany({
        where: {
          enrollmentId: id,
          status: 'PENDING',
        },
        data: { status: 'CANCELLED' },
      });

      res.json({ message: 'Matrícula cancelada com sucesso', enrollment });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao cancelar matrícula' });
    }
  }

  async renew(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      const currentEnrollment = await prisma.enrollment.findUnique({
        where: { id },
        include: { plan: true },
      });

      if (!currentEnrollment) {
        res.status(404).json({ error: 'Matrícula não encontrada' });
        return;
      }

      // [BUG_INTENCIONAL_ID_24] Renewal creates duplicate active enrollment without cancelling the old one
      const start = new Date();
      const end = new Date(start);
      end.setMonth(end.getMonth() + currentEnrollment.plan.durationMonths);

      const newEnrollment = await prisma.enrollment.create({
        data: {
          studentId: currentEnrollment.studentId,
          planId: currentEnrollment.planId,
          startDate: start,
          endDate: end,
          status: 'ACTIVE',
        },
        include: { student: true, plan: true },
      });

      // Generate new invoices
      const monthlyAmount = currentEnrollment.plan.price / currentEnrollment.plan.durationMonths;
      for (let i = 0; i < currentEnrollment.plan.durationMonths; i++) {
        const dueDate = new Date(start);
        dueDate.setMonth(dueDate.getMonth() + i);
        dueDate.setDate(10);

        await prisma.invoice.create({
          data: {
            enrollmentId: newEnrollment.id,
            studentId: currentEnrollment.studentId,
            amount: monthlyAmount,
            discount: 0,
            finalAmount: monthlyAmount,
            dueDate,
            status: 'PENDING',
          },
        });
      }

      res.status(201).json(newEnrollment);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao renovar matrícula' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      await prisma.invoice.deleteMany({ where: { enrollmentId: id } });
      await prisma.enrollment.delete({ where: { id } });

      res.json({ message: 'Matrícula excluída com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao excluir matrícula' });
    }
  }
}
