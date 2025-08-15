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

// Ruta para que el administrador obtenga la lista completa de usuarios
// Esta ruta requiere el permiso 'manage_users'
router.route('/').get(getUsers); 

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

// --- NUEVA RUTA PARA COLABORADORES ---
// Esta ruta solo necesita autenticación, pero no permisos de 'admin'.
// Cualquiera que haya iniciado sesión puede ver la lista de usuarios.
//router.get('/collaborators', protect, getCollaborators);

export default router;