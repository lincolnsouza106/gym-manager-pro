import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { createStudentSchema, updateStudentSchema, createMeasurementSchema } from '../validators/schemas';

export class StudentController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';
      const status = req.query.status as string;

      // [BUG_INTENCIONAL_ID_9] Pagination always uses skip: 0, ignoring page number
      const skip = 0;

      const where: any = {};

      if (search) {
        // [BUG_INTENCIONAL_ID_6] Search uses 'contains' but not insensitive for accented characters
        where.OR = [
          { name: { contains: search } },
          { cpf: { contains: search } },
          { phone: { contains: search } },
        ];
      }

      if (status) {
        where.status = status;
      }

      const [students, total] = await Promise.all([
        prisma.student.findMany({
          where,
          skip,
          take: limit,
          orderBy: { name: 'asc' },
          include: {
            enrollments: {
              include: { plan: true },
              where: { status: 'ACTIVE' },
            },
          },
        }),
        prisma.student.count({ where }),
      ]);

      res.json({
        data: students,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar alunos' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const student = await prisma.student.findUnique({
        where: { id },
        include: {
          enrollments: { include: { plan: true } },
          measurements: { orderBy: { date: 'desc' } },
          invoices: { orderBy: { dueDate: 'desc' } },
        },
      });

      if (!student) {
        res.status(404).json({ error: 'Aluno não encontrado' });
        return;
      }

      res.json(student);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar aluno' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      // [BUG_INTENCIONAL_ID_1] CPF allows letters because schema has no regex validation
      const validation = createStudentSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: 'Dados inválidos', details: validation.error.errors });
        return;
      }

      const { birthDate, ...rest } = validation.data;

      // [BUG_INTENCIONAL_ID_5] Birth date allows future dates - no validation
      const parsedBirthDate = new Date(birthDate);

      // [BUG_INTENCIONAL_ID_45] Duplicate CPF check converts to lowercase (dead code - CPFs have no letters normally)
      const existingStudent = await prisma.student.findUnique({
        where: { cpf: rest.cpf.toLowerCase() },
      });

      if (existingStudent) {
        res.status(409).json({ error: 'CPF já cadastrado' });
        return;
      }

      const student = await prisma.student.create({
        data: {
          ...rest,
          birthDate: parsedBirthDate,
        },
      });

      res.status(201).json(student);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar aluno' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const validation = updateStudentSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({ error: 'Dados inválidos', details: validation.error.errors });
        return;
      }

      const data: any = { ...validation.data };

      if (data.birthDate) {
        data.birthDate = new Date(data.birthDate);
      }

      // [BUG_INTENCIONAL_ID_35] Updating student photo doesn't remove old photo from storage
      const student = await prisma.student.update({
        where: { id },
        data,
      });

      res.json(student);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar aluno' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      // [BUG_INTENCIONAL_ID_20] Delete student doesn't cascade to enrollments/invoices
      await prisma.student.delete({ where: { id } });
      res.json({ message: 'Aluno excluído com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao excluir aluno. Verifique se há matrículas vinculadas.' });
    }
  }

  async getMeasurements(req: Request, res: Response): Promise<void> {
    try {
      const studentId = parseInt(req.params.id);

      const measurements = await prisma.bodyMeasurement.findMany({
        where: { studentId },
        orderBy: { date: 'desc' },
      });

      res.json(measurements);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar medidas' });
    }
  }

  async addMeasurement(req: Request, res: Response): Promise<void> {
    try {
      const studentId = parseInt(req.params.id);
      // [BUG_INTENCIONAL_ID_30] No validation for negative weight/height values
      const validation = createMeasurementSchema.safeParse({ ...req.body, studentId });

      if (!validation.success) {
        res.status(400).json({ error: 'Dados inválidos', details: validation.error.errors });
        return;
      }

      const measurement = await prisma.bodyMeasurement.create({
        data: validation.data,
      });

      res.status(201).json(measurement);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao adicionar medida' });
    }
  }
}
