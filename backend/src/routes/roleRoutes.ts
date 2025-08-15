// En src/routes/roleRoutes.ts
import express from 'express';
import { getRoles, createRole, updateRole, deleteRole, getAllPermissions } from '../controllers/roleController';
import { protect } from '../middleware/authMiddleware';
import permissionMiddleware from '../middleware/permissionMiddleware';

const router = express.Router();

// Obtener todos los roles: Solo para admins con permiso 'read_roles'
router.get('/', protect, permissionMiddleware('read_roles'), getRoles);

// Crear un nuevo rol: Solo para admins con permiso 'create_roles'
router.post('/', protect, permissionMiddleware('create_roles'), createRole);

// Actualizar un rol: Solo para admins con permiso 'update_roles'
router.put('/:id', protect, permissionMiddleware('update_roles'), updateRole);

// Eliminar un rol: Solo para admins con permiso 'delete_roles'
router.delete('/:id', protect, permissionMiddleware('delete_roles'), deleteRole);

// Nueva ruta para obtener todos los permisos
router.get('/permissions', protect, permissionMiddleware('read_roles'), getAllPermissions);

export default router;