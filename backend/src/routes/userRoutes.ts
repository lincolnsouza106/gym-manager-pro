import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();
const userController = new UserController();

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Usuários]
 *     summary: Listar todos os usuários
 *     responses:
 *       200:
 *         description: Lista de usuários
 */
// [BUG_INTENCIONAL_ID_3] Route has no authMiddleware - exposes user data without authentication
router.get('/', userController.getAll);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Usuários]
 *     summary: Obter usuário por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dados do usuário
 */
router.get('/:id', authMiddleware, userController.getById);

/**
 * @swagger
 * /api/users:
 *   post:
 *     tags: [Usuários]
 *     summary: Criar novo usuário
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, RECEPTIONIST, INSTRUCTOR, STUDENT]
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 */
router.post('/', authMiddleware, authorize('ADMIN'), userController.create);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     tags: [Usuários]
 *     summary: Atualizar usuário
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authMiddleware, authorize('ADMIN'), userController.update);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags: [Usuários]
 *     summary: Excluir usuário
 *     security:
 *       - bearerAuth: []
 */
// [BUG_INTENCIONAL_ID_7] Receptionist can delete users (should be ADMIN only)
router.delete('/:id', authMiddleware, authorize('ADMIN', 'RECEPTIONIST'), userController.delete);

export { router as userRoutes };
