"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const taskController_1 = require("../controllers/taskController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Crear una nueva tarea: Permite a admin, editor, project_manager y user crear tareas.
router.post('/', authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)('admin', 'editor', 'project_manager', 'user'), taskController_1.createTask);
// Obtener todas las tareas: Permite a todos los roles ver la lista (filtrada en el controlador).
router.get('/', authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)('admin', 'editor', 'project_manager', 'viewer', 'user'), taskController_1.getTasks);
// Actualizar una tarea: Permite a admin, editor, project_manager y user actualizar (con lógica de pertenencia en el controlador).
router.put('/:id', authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)('admin', 'editor', 'project_manager', 'user'), taskController_1.updateTask);
// Eliminar una tarea: Restringido a admin y project_manager a nivel de ruta (con lógica de creador en el controlador).
router.delete('/:id', authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)('admin', 'project_manager'), taskController_1.deleteTask);
exports.default = router;
