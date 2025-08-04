import express from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Crear una nueva tarea
router.post('/', protect, createTask);

// Obtener todas las tareas
router.get('/', protect, getTasks);

// Actualizar una tarea
router.put('/:id', protect, updateTask);

// Eliminar una tarea
router.delete('/:id', protect, deleteTask);

export default router;