import { Router } from 'express';
import { FinanceController } from '../controllers/financeController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const financeController = new FinanceController();

/**
 * @swagger
 * /api/finance/invoices:
 *   get:
 *     tags: [Financeiro]
 *     summary: Listar todas as faturas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PAID, OVERDUE, CANCELLED]
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: integer
 */
router.get('/invoices', authMiddleware, financeController.getAll);

/**
 * @swagger
 * /api/finance/invoices/{id}:
 *   get:
 *     tags: [Financeiro]
 *     summary: Obter fatura por ID
 *     security:
 *       - bearerAuth: []
 */
router.get('/invoices/:id', authMiddleware, financeController.getById);

/**
 * @swagger
 * /api/finance/invoices:
 *   post:
 *     tags: [Financeiro]
 *     summary: Criar nova fatura
 *     security:
 *       - bearerAuth: []
 */
router.post('/invoices', authMiddleware, financeController.create);

/**
 * @swagger
 * /api/finance/invoices/{id}/pay:
 *   patch:
 *     tags: [Financeiro]
 *     summary: Registrar pagamento de fatura
 *     security:
 *       - bearerAuth: []
 */
router.patch('/invoices/:id/pay', authMiddleware, financeController.pay);

/**
 * @swagger
 * /api/finance/invoices/{id}/discount:
 *   patch:
 *     tags: [Financeiro]
 *     summary: Aplicar desconto na fatura
 *     security:
 *       - bearerAuth: []
 */
router.patch('/invoices/:id/discount', authMiddleware, financeController.applyDiscount);

/**
 * @swagger
 * /api/finance/summary:
 *   get:
 *     tags: [Financeiro]
 *     summary: Obter resumo financeiro
 *     security:
 *       - bearerAuth: []
 */
router.get('/summary', authMiddleware, financeController.getSummary);

/**
 * @swagger
 * /api/finance/invoices/{id}:
 *   delete:
 *     tags: [Financeiro]
 *     summary: Excluir fatura
 *     security:
 *       - bearerAuth: []
 */
router.delete('/invoices/:id', authMiddleware, financeController.delete);

export { router as financeRoutes };
