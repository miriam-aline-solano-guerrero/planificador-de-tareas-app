// backend/server.ts

import connectDB from './src/config/db';
import express from 'express';
import cors from 'cors';
import authRoutes from './src/routes/authRoutes';
import userRoutes from './src/routes/userRoutes';
import taskRoutes from './src/routes/taskRoutes'

connectDB();

const app = express();

app.use((req, res, next) => {
    console.log(`[DEBUG] Petición RECIBIDA en Express: ${req.method} ${req.originalUrl || req.url}`);
    next();
});

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tareas', taskRoutes);

app.get('/', (req, res) => {
  res.send('API está corriendo...');
});

const PORT = process.env.PORT || 5001; // Usamos 5001, que sabemos que ha funcionado en el pasado

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});