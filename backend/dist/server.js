"use strict";
// backend/server.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./config/db"));
// *** SOLO DEJA LA RUTA DE AUTH POR AHORA ***
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
// import userRoutes from './routes/userRoutes'; // Comenta o elimina
// import taskRoutes from './routes/taskRoutes'; // Comenta o elimina
(0, db_1.default)();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// *** SOLO DEJA ESTA LÍNEA DE RUTA ***
app.use('/api/auth', authRoutes_1.default);
// Comenta o elimina otras rutas
// app.use('/api/users', userRoutes);
// app.use('/api/tareas', taskRoutes);
app.get('/', (req, res) => {
    res.send('API está corriendo...');
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
