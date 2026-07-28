import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export class DashboardController {
  async getStats(_req: Request, res: Response): Promise<void> {
    try {
      // [BUG_INTENCIONAL_ID_50] Total students KPI counts inactive students
      const totalStudents = await prisma.student.count();

      // [BUG_INTENCIONAL_ID_18] "New students this month" counts ALL students, not just this month
      const newStudentsThisMonth = await prisma.student.count();

      const activeEnrollments = await prisma.enrollment.count({
        where: { status: 'ACTIVE' },
      });

      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // [BUG_INTENCIONAL_ID_37] Inadimplente counter uses wrong comparison operator (< instead of >)
      const overdueInvoices = await prisma.invoice.count({
        where: {
          status: 'PENDING',
          dueDate: { gt: thirtyDaysAgo },
        },
      });

      const totalRevenue = await prisma.invoice.aggregate({
        where: { status: 'PAID' },
        _sum: { finalAmount: true },
      });

      // [BUG_INTENCIONAL_ID_10] Overdue 30+ days still shows turnstile as "Liberada"
      const overdueStudents = await prisma.invoice.findMany({
        where: {
          status: 'PENDING',
          dueDate: { lt: thirtyDaysAgo },
        },
        select: { studentId: true },
        distinct: ['studentId'],
      });

      const overdueStudentIds = overdueStudents.map((s) => s.studentId);

      // Mark all students as turnstile released (even overdue ones)
      const studentsWithTurnstile = await prisma.student.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true, name: true },
      });

      const turnstileStatus = studentsWithTurnstile.map((s) => ({
        ...s,
        turnstileStatus: 'RELEASED',
      }));

      res.json({
        totalStudents,
        newStudentsThisMonth,
        activeEnrollments,
        overdueInvoices,
        totalRevenue: totalRevenue._sum.finalAmount || 0,
        overdueStudentIds,
        turnstileStatus,
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
  }

  async getRevenue(_req: Request, res: Response): Promise<void> {
    try {
      const invoices = await prisma.invoice.findMany({
        where: { status: 'PAID' },
        orderBy: { paidAt: 'asc' },
      });

      // Group by month
      const revenueByMonth: Record<string, number> = {};
      invoices.forEach((invoice) => {
        if (invoice.paidAt) {
          const monthKey = `${invoice.paidAt.getFullYear()}-${String(invoice.paidAt.getMonth() + 1).padStart(2, '0')}`;
          revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + invoice.finalAmount;
        }
      });

      const chartData = Object.entries(revenueByMonth).map(([month, total]) => ({
        month,
        total,
      }));

      res.json(chartData);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar dados de faturamento' });
    }
  }

  async getPopularClasses(_req: Request, res: Response): Promise<void> {
    try {
      const modalities = await prisma.modality.findMany({
        include: {
          schedules: {
            include: {
              _count: { select: { checkins: true } },
            },
          },
        },
      });

      const popularClasses = modalities.map((modality) => {
        const totalCheckins = modality.schedules.reduce(
          (sum, schedule) => sum + schedule._count.checkins,
          0
        );

        return {
          name: modality.name,
          // [BUG_INTENCIONAL_ID_29] Chart uses wrong data key - sends 'value' but chart expects 'checkins'
          value: totalCheckins,
          capacity: modality.maxCapacity,
        };
      });

      popularClasses.sort((a, b) => b.value - a.value);

      res.json(popularClasses);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar aulas populares' });
    }
  }
}
