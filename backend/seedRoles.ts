import mongoose from 'mongoose';
import Role from './src/models/Role';
import User from './src/models/User';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI no está definido en las variables de entorno.");
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');
    } catch (err: any) {
        console.error(err.message);
        process.exit(1);
    }
};

const seedRoles = async () => {
    await connectDB();
    
    try {
        console.log('Borrando roles existentes...');
        await Role.deleteMany({});
        console.log('Borrando usuarios existentes...');
        await User.deleteMany({});

        // Definir los permisos para cada rol
        const adminPermissions = [
            'create_task',
            'read_tasks',
            'edit_task',
            'delete_task',
            'manage_roles',
            'manage_users',
        ];

        const userPermissions = [
            'create_task',
            'read_tasks',
            'edit_own_task',
            'delete_own_task',
        ];

        // Crear los roles en la base de datos
        const adminRole = await Role.create({
            name: 'admin',
            permissions: adminPermissions
        });

        const userRole = await Role.create({
            name: 'user',
            permissions: userPermissions
        });

        console.log('Roles "admin" y "user" creados exitosamente.');

        // Crear un usuario administrador por defecto para pruebas
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        // Por ahora, usa la contraseña en texto plano para que coincida con tus cambios temporales
        await User.create({
            name: 'admin',
            email: 'admin@example.com',
            password: adminPassword,
            role: adminRole._id,
        });

        console.log('Usuario administrador por defecto creado.');

        process.exit(0);
    } catch (error) {
        console.error('Error en el script de seeding:', error);
        process.exit(1);
    }
};

seedRoles();