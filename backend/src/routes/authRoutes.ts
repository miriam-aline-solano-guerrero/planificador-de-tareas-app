import express from 'express';
import { registerUser, loginUser } from '../controllers/authController';
//import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Rutas públicas
router.post('/register', registerUser);
router.post('/login', loginUser);

// Ruta protegida (requiere autenticación)
//router.get('/profile', protect, getUserProfile);
//router.get('/profile', getUserProfile);

export default router;