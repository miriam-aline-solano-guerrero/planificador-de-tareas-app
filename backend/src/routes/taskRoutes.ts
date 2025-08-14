import { Router } from 'express';
import { 
    getTasks, 
    createTask, 
    updateTask, 
    deleteTask,
    updateActivityStatus,
} from '../controllers/taskController';
import { protect } from '../middleware/authMiddleware';
import permissionMiddleware from '../middleware/permissionMiddleware';

const router = Router();

// Rutas para obtener y crear tareas.
router.route('/')
    .get(protect, getTasks)
    .post(protect, permissionMiddleware('create_task'), createTask);

// --- CAMBIO AQUÍ ---
// Rutas para acciones en una tarea específica por ID.
router.route('/:id')
    // El middleware ahora verifica el permiso 'edit_own_task'
    .put(protect, permissionMiddleware('edit_own_task'), updateTask)
    // El middleware ahora verifica el permiso 'delete_own_task'
    .delete(protect, permissionMiddleware('delete_own_task'), deleteTask);

// Ruta para actualizar el estado de una actividad específica.
// Esto requiere el permiso 'edit_own_task' para el rol 'user'.
router.put('/:taskId/activities/:activityId', protect, permissionMiddleware('edit_own_task'), updateActivityStatus);

export default router;