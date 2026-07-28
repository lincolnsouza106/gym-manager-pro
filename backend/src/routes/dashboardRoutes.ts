import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const dashboardController = new DashboardController();

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     tags: [Dashboard]
 *     summary: Obter estatísticas gerais
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas do dashboard
 */
router.get('/stats', authMiddleware, dashboardController.getStats);

/**
 * @swagger
 * /api/dashboard/revenue:
 *   get:
 *     tags: [Dashboard]
 *     summary: Obter dados de faturamento por mês
 *     security:
 *       - bearerAuth: []
 */
router.get('/revenue', authMiddleware, dashboardController.getRevenue);

/**
 * @swagger
 * /api/dashboard/popular-classes:
 *   get:
 *     tags: [Dashboard]
 *     summary: Obter aulas mais populares
 *     security:
 *       - bearerAuth: []
 */
router.get('/popular-classes', authMiddleware, dashboardController.getPopularClasses);

export { router as dashboardRoutes };
