// backend/server.ts

import dotenv from 'dotenv';
dotenv.config();

console.log('Valor de MONGODB_URI en server.ts:', process.env.MONGODB_URI); // <-- AGREGAR ESTA LÍNEA

import connectDB from './src/config/db';
import express from 'express';
import cors from 'cors';
import authRoutes from './src/routes/authRoutes';
import userRoutes from './src/routes/userRoutes';
import taskRoutes from './src/routes/taskRoutes'
import roleRoutes from './src/routes/roleRoutes';
import mongoose from 'mongoose';

//Llama a la función 'connectDB' para establecer la conexión con MongoDB al iniciar el servidor.
connectDB();
//Modo de depuración de Mongoose.
mongoose.set('debug', true);
//Inicialización de aplicación express
const app = express();

//Función que se ejecuta por cada solicitud
app.use((req, res, next) => {
  console.log(`[DEBUG] Petición RECIBIDA en Express: ${req.method} ${req.originalUrl || req.url}`);
  next();
});


// Permite a la aplicación analizar el cuerpo de las solicitudes entrantes como JSON
// Esto es crucial para manejar datos enviados desde el frontend 
app.use(express.json());
app.use(cors());

//Configuración rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/roles', roleRoutes);

app.get('/', (req, res) => {
  res.send('API corriendo...');
});


const PORT = process.env.PORT || 5003; 

//inicio del servidor express en el puerto
app.listen(PORT, () => {
   console.log(`Servidor corriendo en el puerto ${PORT}`);
});