import { Router } from 'express';
import { PlanController } from '../controllers/planController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const planController = new PlanController();

/**
 * @swagger
 * /api/plans:
 *   get:
 *     tags: [Planos]
 *     summary: Listar todos os planos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de planos
 */
router.get('/', authMiddleware, planController.getAll);

/**
 * @swagger
 * /api/plans/{id}:
 *   get:
 *     tags: [Planos]
 *     summary: Obter plano por ID
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authMiddleware, planController.getById);

/**
 * @swagger
 * /api/plans:
 *   post:
 *     tags: [Planos]
 *     summary: Criar novo plano
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authMiddleware, planController.create);

/**
 * @swagger
 * /api/plans/{id}:
 *   put:
 *     tags: [Planos]
 *     summary: Atualizar plano
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authMiddleware, planController.update);

/**
 * @swagger
 * /api/plans/{id}:
 *   delete:
 *     tags: [Planos]
 *     summary: Excluir plano
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authMiddleware, planController.delete);

export { router as planRoutes };
