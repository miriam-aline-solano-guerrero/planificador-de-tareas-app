import express from 'express';
import { updateUser, deleteUser, getUsers } from '../controllers/userController';


const router = express.Router();

router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.get('/', getUsers)

export default router;