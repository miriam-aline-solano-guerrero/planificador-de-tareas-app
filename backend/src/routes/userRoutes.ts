import express from 'express';
import { 
    updateUser, 
    deleteUser, 
    getUsers, 
    updateUserRole 
} from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';
import permissionMiddleware from '../middleware/permissionMiddleware'; // Asegúrate de importar el middleware

const router = express.Router();

// Ruta para que el administrador obtenga la lista completa de usuarios
// Esta ruta requiere el permiso 'manage_users'
router.route('/').get(protect, permissionMiddleware('manage_users'), getUsers); 

// Ruta para actualizar el rol de un usuario específico
// También requiere el permiso 'manage_users'
router.route('/:id/role')
    .put(protect, permissionMiddleware('manage_users'), updateUserRole);

// Rutas para actualizar y eliminar un usuario
// Aquí puedes decidir si solo el dueño del perfil puede modificarlo o si el admin también puede.
// Si el admin puede, el controlador debe tener esa lógica.
router.route('/:id')
    .put(protect, updateUser) 
    .delete(protect, deleteUser); 

export default router;