import express from 'express';
import {
    deleteUser, 
    getUsers, 
    updateUser, 
    updateUserRole,
    getCollaborators
} from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';
import permissionMiddleware from '../middleware/permissionMiddleware'; // Asegúrate de importar el middleware

const router = express.Router();

// Ruta para que el rol admin obtenga la lista completa de usuarios registrados con el permiso 'manage_users'
router.route('/').get(getUsers); 

// Ruta para actualizar el rol de un usuario específico
// También requiere el permiso 'manage_users'
router.route('/:id/role')
    .put(protect, permissionMiddleware('manage_users'), updateUserRole);

// Rutas para actualizar y eliminar un usuario
router.route('/:id')
    .put(protect, updateUser) 
    .delete(protect, deleteUser); 

export default router;