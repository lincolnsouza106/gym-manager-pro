import { Router } from 'express';
import { StudentController } from '../controllers/studentController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const studentController = new StudentController();

/**
 * @swagger
 * /api/students:
 *   get:
 *     tags: [Alunos]
 *     summary: Listar todos os alunos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista paginada de alunos
 */
router.get('/', authMiddleware, studentController.getAll);

/**
 * @swagger
 * /api/students/{id}:
 *   get:
 *     tags: [Alunos]
 *     summary: Obter aluno por ID
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authMiddleware, studentController.getById);

/**
 * @swagger
 * /api/students:
 *   post:
 *     tags: [Alunos]
 *     summary: Criar novo aluno
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authMiddleware, studentController.create);

/**
 * @swagger
 * /api/students/{id}:
 *   put:
 *     tags: [Alunos]
 *     summary: Atualizar aluno
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authMiddleware, studentController.update);

/**
 * @swagger
 * /api/students/{id}:
 *   delete:
 *     tags: [Alunos]
 *     summary: Excluir aluno
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authMiddleware, studentController.delete);

/**
 * @swagger
 * /api/students/{id}/measurements:
 *   get:
 *     tags: [Alunos]
 *     summary: Obter medidas do aluno
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id/measurements', authMiddleware, studentController.getMeasurements);

/**
 * @swagger
 * /api/students/{id}/measurements:
 *   post:
 *     tags: [Alunos]
 *     summary: Adicionar medida corporal
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/measurements', authMiddleware, studentController.addMeasurement);

export { router as studentRoutes };
