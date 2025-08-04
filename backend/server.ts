// backend/server.ts

import connectDB from './src/config/db';
import express from 'express';
import cors from 'cors';
import authRoutes from './src/routes/authRoutes';
import userRoutes from './src/routes/userRoutes';
import taskRoutes from './src/routes/taskRoutes'
import roleRoutes from './src/routes/roleRoutes';

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
app.use('/api/roles', roleRoutes);

app.get('/', (req, res) => {
  res.send('API corriendo...');
});

const PORT = process.env.PORT || 5003; // 5003 pq no funciono en puerto 5000

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});