import { Router } from 'express';
import { EnrollmentController } from '../controllers/enrollmentController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const enrollmentController = new EnrollmentController();

/**
 * @swagger
 * /api/enrollments:
 *   get:
 *     tags: [Matrículas]
 *     summary: Listar todas as matrículas
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authMiddleware, enrollmentController.getAll);

/**
 * @swagger
 * /api/enrollments/{id}:
 *   get:
 *     tags: [Matrículas]
 *     summary: Obter matrícula por ID
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authMiddleware, enrollmentController.getById);

/**
 * @swagger
 * /api/enrollments:
 *   post:
 *     tags: [Matrículas]
 *     summary: Criar nova matrícula
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authMiddleware, enrollmentController.create);

/**
 * @swagger
 * /api/enrollments/{id}/cancel:
 *   patch:
 *     tags: [Matrículas]
 *     summary: Cancelar matrícula
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/cancel', authMiddleware, enrollmentController.cancel);

/**
 * @swagger
 * /api/enrollments/{id}/renew:
 *   post:
 *     tags: [Matrículas]
 *     summary: Renovar matrícula
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/renew', authMiddleware, enrollmentController.renew);

/**
 * @swagger
 * /api/enrollments/{id}:
 *   delete:
 *     tags: [Matrículas]
 *     summary: Excluir matrícula
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authMiddleware, enrollmentController.delete);

export { router as enrollmentRoutes };
