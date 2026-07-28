import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { createInvoiceSchema, payInvoiceSchema } from '../validators/schemas';

export class FinanceController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const status = req.query.status as string;
      const studentId = req.query.studentId ? parseInt(req.query.studentId as string) : undefined;

      const where: any = {};
      if (status) where.status = status;
      if (studentId) where.studentId = studentId;

      // [BUG_INTENCIONAL_ID_27] Overdue filter compares dates as strings instead of Date objects
      if (status === 'OVERDUE') {
        where.status = 'PENDING';
        where.dueDate = { lt: new Date().toISOString() };
      }

      const invoices = await prisma.invoice.findMany({
        where,
        include: {
          student: true,
          enrollment: { include: { plan: true } },
        },
        orderBy: { dueDate: 'desc' },
      });

      res.json(invoices);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar faturas' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
          student: true,
          enrollment: { include: { plan: true } },
        },
      });

      if (!invoice) {
        res.status(404).json({ error: 'Fatura não encontrada' });
        return;
      }

      res.json(invoice);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar fatura' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const validation = createInvoiceSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: 'Dados inválidos', details: validation.error.errors });
        return;
      }

      const { discount, dueDate, ...rest } = validation.data;
      const discountValue = discount || 0;
      const finalAmount = rest.amount - discountValue;

      const invoice = await prisma.invoice.create({
        data: {
          ...rest,
          discount: discountValue,
          finalAmount,
          dueDate: new Date(dueDate),
          status: 'PENDING',
        },
        include: {
          student: true,
          enrollment: { include: { plan: true } },
        },
      });

      res.status(201).json(invoice);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar fatura' });
    }
  }

  async pay(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const validation = payInvoiceSchema.safeParse(req.body);

      // [BUG_INTENCIONAL_ID_15] Paying invoice doesn't update enrollment status
      // [BUG_INTENCIONAL_ID_47] Partial payment not supported - always marks as fully paid
      const invoice = await prisma.invoice.update({
        where: { id },
        data: {
          status: 'PAID',
          paidAt: req.body.paidAt ? new Date(req.body.paidAt) : new Date(),
        },
        include: {
          student: true,
          enrollment: { include: { plan: true } },
        },
      });

      res.json({ message: 'Pagamento registrado com sucesso', invoice });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao registrar pagamento' });
    }
  }

  async applyDiscount(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { discountPercent } = req.body;

      if (discountPercent === undefined || discountPercent < 0 || discountPercent > 100) {
        res.status(400).json({ error: 'Percentual de desconto inválido (0-100)' });
        return;
      }

      const invoice = await prisma.invoice.findUnique({ where: { id } });
      if (!invoice) {
        res.status(404).json({ error: 'Fatura não encontrada' });
        return;
      }

      // [BUG_INTENCIONAL_ID_2] Discount subtracts fixed value instead of percentage
      const discountAmount = discountPercent;
      const finalAmount = invoice.amount - discountAmount;

      const updated = await prisma.invoice.update({
        where: { id },
        data: {
          discount: discountAmount,
          finalAmount: Math.max(finalAmount, 0),
        },
        include: {
          student: true,
          enrollment: { include: { plan: true } },
        },
      });

      res.json({ message: 'Desconto aplicado com sucesso', invoice: updated });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao aplicar desconto' });
    }
  }

  async getSummary(_req: Request, res: Response): Promise<void> {
    try {
      // [BUG_INTENCIONAL_ID_21] Total revenue sums including cancelled invoices
      const allInvoices = await prisma.invoice.findMany();

      const totalRevenue = allInvoices
        .filter((i) => i.status === 'PAID' || i.status === 'CANCELLED')
        .reduce((sum, i) => sum + i.finalAmount, 0);

      const pendingAmount = allInvoices
        .filter((i) => i.status === 'PENDING')
        .reduce((sum, i) => sum + i.finalAmount, 0);

      const overdueAmount = allInvoices
        .filter((i) => i.status === 'OVERDUE')
        .reduce((sum, i) => sum + i.finalAmount, 0);

      const totalPaid = allInvoices.filter((i) => i.status === 'PAID').length;
      const totalPending = allInvoices.filter((i) => i.status === 'PENDING').length;
      const totalOverdue = allInvoices.filter((i) => i.status === 'OVERDUE').length;

      res.json({
        totalRevenue,
        pendingAmount,
        overdueAmount,
        totalPaid,
        totalPending,
        totalOverdue,
        totalInvoices: allInvoices.length,
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar resumo financeiro' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await prisma.invoice.delete({ where: { id } });
      res.json({ message: 'Fatura excluída com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao excluir fatura' });
    }
  }
}
