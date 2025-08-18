// En src/routes/roleRoutes.ts
import express from 'express';
import { getRoles, createRole, updateRole, deleteRole, getAllPermissions } from '../controllers/roleController';
import { protect } from '../middleware/authMiddleware';
import permissionMiddleware from '../middleware/permissionMiddleware';

const router = express.Router();

// Obtener todos los roles: Solo para rol admin
router.get('/', protect, permissionMiddleware('read_roles'), getRoles);

// Crear un nuevo rol: Solo para rol admin
router.post('/', protect, permissionMiddleware('create_roles'), createRole);

// Actualizar un rol: Solo para rol admin 
router.put('/:id', protect, permissionMiddleware('update_roles'), updateRole);

// Eliminar un rol: Solo para rol admin
router.delete('/:id', protect, permissionMiddleware('delete_roles'), deleteRole);

// Nueva ruta para obtener todos los permisos y poder elegirlos al crear un nuevo rol
router.get('/permissions', protect, permissionMiddleware('read_roles'), getAllPermissions);

export default router;