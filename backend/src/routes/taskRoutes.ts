import express from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController';
import { protect, authorizeRoles } from '../middleware/authMiddleware';

const router = express.Router();

// Crear una nueva tarea: Permite a admin, editor, project_manager y user crear tareas.
router.post('/', protect, authorizeRoles('admin', 'editor', 'project_manager', 'user'), createTask);

// Obtener todas las tareas: Permite a todos los roles ver la lista (filtrada en el controlador).
router.get('/', protect, authorizeRoles('admin', 'editor', 'project_manager', 'viewer', 'user'), getTasks);

// Actualizar una tarea: Permite a admin, editor, project_manager y user actualizar (con lógica de pertenencia en el controlador).
router.put('/:id', protect, authorizeRoles('admin', 'editor', 'project_manager', 'user'), updateTask);

// Eliminar una tarea: Restringido a admin y project_manager a nivel de ruta (con lógica de creador en el controlador).
router.delete('/:id', protect, authorizeRoles('admin', 'project_manager'), deleteTask);

export default router;