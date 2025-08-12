import { Router } from 'express';
import { 
  getTasks, 
  createTask, 
  updateTask, 
  deleteTask,
  updateActivityStatus,
} from '../controllers/taskController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// La ruta POST para crear una tarea
router.route('/').get(protect, getTasks).post(protect, createTask);

// Las demás rutas
router.route('/:id').get(protect, getTasks).put(protect, updateTask).delete(protect, deleteTask);

// <-- NUEVA RUTA para actualizar el estado de una actividad
router.put('/:taskId/activities/:activityId', protect, updateActivityStatus);

export default router;