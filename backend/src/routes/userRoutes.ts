import express from 'express';
import { updateUser, deleteUser, getUsers } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';


const router = express.Router();


router.route('/').get(protect, getUsers); 

router.route('/:id')
    .put(protect, updateUser) // También protegemos las rutas de actualización
    .delete(protect, deleteUser); // y eliminación

export default router;