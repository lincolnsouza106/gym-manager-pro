import { Router } from 'express';
import { ScheduleController } from '../controllers/scheduleController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const scheduleController = new ScheduleController();

/**
 * @swagger
 * /api/schedules:
 *   get:
 *     tags: [Agenda]
 *     summary: Listar todos os horários de aulas
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authMiddleware, scheduleController.getAll);

/**
 * @swagger
 * /api/schedules/{id}:
 *   get:
 *     tags: [Agenda]
 *     summary: Obter horário por ID
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authMiddleware, scheduleController.getById);

/**
 * @swagger
 * /api/schedules:
 *   post:
 *     tags: [Agenda]
 *     summary: Criar novo horário de aula
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authMiddleware, scheduleController.create);

/**
 * @swagger
 * /api/schedules/{id}:
 *   put:
 *     tags: [Agenda]
 *     summary: Atualizar horário
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authMiddleware, scheduleController.update);

/**
 * @swagger
 * /api/schedules/{id}:
 *   delete:
 *     tags: [Agenda]
 *     summary: Excluir horário
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authMiddleware, scheduleController.delete);

/**
 * @swagger
 * /api/schedules/{id}/checkin:
 *   post:
 *     tags: [Agenda]
 *     summary: Realizar check-in de aluno em aula
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/checkin', authMiddleware, scheduleController.checkin);

export { router as scheduleRoutes };
