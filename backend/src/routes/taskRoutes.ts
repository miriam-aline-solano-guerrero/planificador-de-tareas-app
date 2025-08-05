import { Router } from 'express';
import { getTasks, getTask, createTask, updateTask, deleteTask } from '../controllers/taskController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// La ruta POST para crear una tarea
router.route('/').get(protect, getTasks).post(protect, createTask);

// Las demás rutas
router.route('/:id').get(protect, getTask).put(protect, updateTask).delete(protect, deleteTask);

export default router;