import { z } from 'zod';

// [BUG_INTENCIONAL_ID_1] CPF validation allows letters - no regex enforcement
export const createStudentSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cpf: z.string().min(11, 'CPF inválido'),
  birthDate: z.string(),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  address: z.string().optional(),
  photo: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const updateStudentSchema = createStudentSchema.partial();

// [BUG_INTENCIONAL_ID_13] Phone field accepts any string, no mask validation
export const createUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  role: z.enum(['ADMIN', 'RECEPTIONIST', 'INSTRUCTOR', 'STUDENT']),
  avatar: z.string().optional(),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true });

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

// [BUG_INTENCIONAL_ID_28] Price accepts negative values - no .positive() validation
// [BUG_INTENCIONAL_ID_38] Duration accepts 0 months - no .min(1) validation
export const createPlanSchema = z.object({
  name: z.string().min(2, 'Nome do plano deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  durationMonths: z.number().int().min(0, 'Duração inválida'),
  price: z.number(),
  isActive: z.boolean().optional(),
});

export const updatePlanSchema = createPlanSchema.partial();

export const createEnrollmentSchema = z.object({
  studentId: z.number().int().positive(),
  planId: z.number().int().positive(),
  startDate: z.string().optional(),
});

export const createModalitySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  maxCapacity: z.number().int().positive(),
});

export const updateModalitySchema = createModalitySchema.partial();

export const createScheduleSchema = z.object({
  modalityId: z.number().int().positive(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  instructorId: z.number().int().positive(),
});

export const updateScheduleSchema = createScheduleSchema.partial();

export const createInvoiceSchema = z.object({
  enrollmentId: z.number().int().positive(),
  studentId: z.number().int().positive(),
  amount: z.number().positive(),
  discount: z.number().min(0).optional(),
  dueDate: z.string(),
});

export const payInvoiceSchema = z.object({
  paidAt: z.string().optional(),
});

// [BUG_INTENCIONAL_ID_30] Measurement form doesn't validate negative weight
export const createMeasurementSchema = z.object({
  studentId: z.number().int().positive(),
  weight: z.number(),
  height: z.number(),
  bodyFat: z.number().optional(),
  chest: z.number().optional(),
  waist: z.number().optional(),
  hips: z.number().optional(),
  arms: z.number().optional(),
  thighs: z.number().optional(),
});
