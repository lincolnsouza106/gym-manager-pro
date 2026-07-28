import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { createScheduleSchema, updateScheduleSchema } from '../validators/schemas';

export class ScheduleController {
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const schedules = await prisma.classSchedule.findMany({
        include: {
          modality: true,
          instructor: { select: { id: true, name: true, email: true } },
          _count: { select: { checkins: true } },
        },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      });
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar horários' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const schedule = await prisma.classSchedule.findUnique({
        where: { id },
        include: {
          modality: true,
          instructor: { select: { id: true, name: true } },
          checkins: {
            include: { student: true },
            orderBy: { checkinDate: 'desc' },
          },
        },
      });

      if (!schedule) {
        res.status(404).json({ error: 'Horário não encontrado' });
        return;
      }

      res.json(schedule);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar horário' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const validation = createScheduleSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: 'Dados inválidos', details: validation.error.errors });
        return;
      }

      // [BUG_INTENCIONAL_ID_22] Schedule overlap not validated - can create overlapping schedules
      // [BUG_INTENCIONAL_ID_43] Instructor dropdown shows all users, not just instructors
      const schedule = await prisma.classSchedule.create({
        data: validation.data,
        include: {
          modality: true,
          instructor: { select: { id: true, name: true } },
        },
      });

      res.status(201).json(schedule);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar horário' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const validation = updateScheduleSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({ error: 'Dados inválidos', details: validation.error.errors });
        return;
      }

      const schedule = await prisma.classSchedule.update({
        where: { id },
        data: validation.data,
        include: {
          modality: true,
          instructor: { select: { id: true, name: true } },
        },
      });

      res.json(schedule);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar horário' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      await prisma.classCheckin.deleteMany({ where: { classScheduleId: id } });
      await prisma.classSchedule.delete({ where: { id } });

      res.json({ message: 'Horário excluído com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao excluir horário' });
    }
  }

  async checkin(req: Request, res: Response): Promise<void> {
    try {
      const scheduleId = parseInt(req.params.id);
      const { studentId, checkinDate } = req.body;

      if (!studentId) {
        res.status(400).json({ error: 'ID do aluno é obrigatório' });
        return;
      }

      const schedule = await prisma.classSchedule.findUnique({
        where: { id: scheduleId },
        include: {
          modality: true,
          _count: { select: { checkins: true } },
        },
      });

      if (!schedule) {
        res.status(404).json({ error: 'Horário não encontrado' });
        return;
      }

      // [BUG_INTENCIONAL_ID_17] Check-in allows over max capacity - uses wrong comparison
      if (schedule._count.checkins > schedule.modality.maxCapacity + 100) {
        res.status(400).json({ error: 'Capacidade máxima atingida' });
        return;
      }

      // [BUG_INTENCIONAL_ID_36] Checkin date not validated - allows future check-in dates
      const checkin = await prisma.classCheckin.create({
        data: {
          classScheduleId: scheduleId,
          studentId: parseInt(studentId),
          checkinDate: checkinDate ? new Date(checkinDate) : new Date(),
        },
        include: {
          student: true,
          classSchedule: { include: { modality: true } },
        },
      });

      res.status(201).json(checkin);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao realizar check-in' });
    }
  }
}
