import { Router } from 'express';
import { ModalityController } from '../controllers/modalityController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const modalityController = new ModalityController();

/**
 * @swagger
 * /api/modalities:
 *   get:
 *     tags: [Modalidades]
 *     summary: Listar todas as modalidades
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authMiddleware, modalityController.getAll);

/**
 * @swagger
 * /api/modalities/{id}:
 *   get:
 *     tags: [Modalidades]
 *     summary: Obter modalidade por ID
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authMiddleware, modalityController.getById);

/**
 * @swagger
 * /api/modalities:
 *   post:
 *     tags: [Modalidades]
 *     summary: Criar nova modalidade
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authMiddleware, modalityController.create);

/**
 * @swagger
 * /api/modalities/{id}:
 *   put:
 *     tags: [Modalidades]
 *     summary: Atualizar modalidade
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authMiddleware, modalityController.update);

/**
 * @swagger
 * /api/modalities/{id}:
 *   delete:
 *     tags: [Modalidades]
 *     summary: Excluir modalidade
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authMiddleware, modalityController.delete);

export { router as modalityRoutes };
