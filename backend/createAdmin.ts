import mongoose from 'mongoose';
// Se ha eliminado la importación de bcrypt
import User from './src/models/User'; // ruta modelo de Usuario
import Role from './src/models/Role'; // ruta modelo de Rol
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = 'mongodb://127.0.0.1:27017/planificador-tareas';
const ADMIN_EMAIL = 'admin@hotmail.com';
const ADMIN_PASSWORD = 'password';

const createAdmin = async () => {
  if (!MONGO_URI) {
    console.error('Error: MONGO_URI no está definido');
    return;
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log('Conectado a la base de datos.');

    // 1. Encontrar o crear el rol de 'admin'
    let adminRole = await Role.findOne({ name: 'admin' });
    if (!adminRole) {
      adminRole = new Role({ name: 'admin' });
      await adminRole.save();
      console.log('Rol "admin" creado.');
    } else {
      console.log('El rol "admin" ya existe.');
    }

    // 2. Comprobar si el usuario admin ya existe
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
      console.log('El usuario "admin" ya existe.');
      return;
    }

    // 3. Crear el usuario con el rol de 'admin'
    // La contraseña se guarda en texto plano
    const adminUser = new User({
      name: 'Admin',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD, // <-- Se asigna la contraseña directamente
      role: adminRole._id,
    });

    await adminUser.save();
    console.log('¡Usuario "admin" creado exitosamente!');
    
  } catch (error) {
    console.error('Error al crear el usuario admin:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Conexión a la base de datos cerrada.');
  }
};

createAdmin();