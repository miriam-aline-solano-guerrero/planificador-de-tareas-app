import { Router } from 'express'; // Importamos 'Router' de Express para poder crear las rutas
import {
    crearTarea,
    getTareas,
    getTareasId,
    updateTarea,
    deleteTarea
} from '../controllers/taskController'; // Importamos TODAS las funciones del controlador de tareas

const router = Router(); // nueva instancia de Router. Este objeto 'router' nos permite definir las rutas.

// --- Definición de Rutas para la API de Tareas ---

// 1. Ruta para CREAR una nueva tarea
router.post('/', crearTarea);

// 2. Ruta para OBTENER TODAS las tareas
router.get('/', getTareas);

// 3. Ruta para OBTENER UNA tarea específica por su ID
router.get('/:id', getTareasId);

// 4. Ruta para ACTUALIZAR una tarea existente por su ID
router.put('/:id', updateTarea);

// 5. Ruta para ELIMINAR una tarea por su ID
router.delete('/:id', deleteTarea);

export default router; // Exportar 'router' para poder usarlo y "conectarlo" en archivo 'server.ts'.