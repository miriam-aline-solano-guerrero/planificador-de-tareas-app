import mongoose, { Document, Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

// Define la interfaz para el documento de usuario
// Extiende 'Document' para incluir propiedades de Mongoose como _id, save(), etc.
export interface IUser extends Document {
  _id: Types.ObjectId; // Añadido explícitamente para asegurar el tipado
  username: string;
  email: string;
  password: string;
  role?: 'user' | 'admin' | 'editor' | 'viewer' | 'project_manager'; // Roles definidos
  createdAt: Date;
  // Método de instancia para comparar contraseñas
  matchPassword(enteredPassword: string): Promise<boolean>;
}

// Define el esquema de Mongoose para el usuario
const UserSchema: Schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // Asegura que el nombre de usuario sea único
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Asegura que el email sea único
    trim: true,
    lowercase: true, // Guarda el email en minúsculas
    match: [/.+\@.+\..+/, 'Por favor, introduce un email válido'], // Validación de formato
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // Longitud mínima de la contraseña
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'editor', 'viewer', 'project_manager'], // Roles permitidos
    default: 'user', // Rol por defecto al crear un usuario
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware Pre-save: Hashear la contraseña antes de guardar
UserSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password')) { // Solo hashear si la contraseña ha sido modificada
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método de instancia: Comparar contraseña
UserSchema.methods.matchPassword = async function(this: IUser, enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Exporta el modelo de usuario
export default mongoose.model<IUser>('User', UserSchema);