// En src/seeder/createRoles.ts

import mongoose from 'mongoose';
import User from './src/models/User';
import Role from './src/models/Role';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/planificador-tareas';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@hotmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password';

const createAdminAndRoles = async () => {
  if (!MONGO_URI) {
    console.error('Error: MONGO_URI no está definido');
    return;
  }

  try {
    console.log('Intentando conectar a la base de datos...');
    await mongoose.connect(MONGO_URI);
    console.log('Conexión exitosa a la base de datos.');

    // 1. Encontrar o crear el rol de 'admin'
    let adminRole = await Role.findOne({ name: 'admin' });
    if (!adminRole) {
      // Si el rol no existe, lo crea con los permisos de admin
      adminRole = new Role({
        name: 'admin',
        permissions: ['read_users', 'create_users', 'update_users', 'delete_users', 'read_roles', 'create_roles', 'update_roles', 'delete_roles']
      });
      await adminRole.save();
      console.log('Rol "admin" creado con permisos.');
    } else {
      console.log('El rol "admin" ya existe.');
      // Actualiza los permisos si el rol ya existe
      await Role.updateOne({ name: 'admin' }, { $set: { permissions: ['read_users', 'create_users', 'update_users', 'delete_users', 'read_roles', 'create_roles', 'update_roles', 'delete_roles'] } });
      console.log('Permisos del rol "admin" actualizados.');
    }
    
    // 2. Encontrar o crear el rol de 'user'
    let userRole = await Role.findOne({ name: 'user' });
    if (!userRole) {
        userRole = new Role({
            name: 'user',
            permissions: ['read_tasks', 'create_tasks', 'update_tasks', 'delete_tasks', 'read_users']
        });
        await userRole.save();
        console.log('Rol "user" creado con permisos.');
    } else {
        console.log('El rol "user" ya existe.');
        // Actualiza los permisos del rol user
        await Role.updateOne({ name: 'user' }, { $set: { permissions: ['read_tasks', 'create_tasks', 'update_tasks', 'delete_tasks', 'read_users'] } });
        console.log('Permisos del rol "user" actualizados.');
    }

    // 3. Comprobar si el usuario admin ya existe y crearlo si no
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
      console.log('El usuario "admin" ya existe.');
      return;
    }

    // 4. Crear el usuario admin
    const adminUser = new User({
      name: 'Admin',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: adminRole._id,
    });

    await adminUser.save();
    console.log('¡Usuario "admin" creado exitosamente!');
    
  } catch (error) {
    console.error('Error al ejecutar el seeder:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Conexión a la base de datos cerrada.');
  }
};

// Llama a la función principal
createAdminAndRoles();