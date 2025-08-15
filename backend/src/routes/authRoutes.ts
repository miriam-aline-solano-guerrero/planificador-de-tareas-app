import express from 'express';
import { registerUser, loginUser } from '../controllers/authController';


const router = express.Router();

// Rutas públicas
router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;