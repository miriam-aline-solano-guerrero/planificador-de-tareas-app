import mongoose, { Document, Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IRole } from './Role';

export interface IUser extends Document {
  _id: Types.ObjectId; // Añadido explícitamente para asegurar el tipado
  email: string;
  password: string;
  role?: IRole['_id']; // Roles definidos
  createdAt: Date;
  // Método de instancia para comparar contraseñas
  matchPassword(enteredPassword: string): Promise<boolean>;
}

// Define el esquema de Mongoose para el usuario
const UserSchema: Schema = new mongoose.Schema({
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true,
    //default: 'admin', // Rol por defecto al crear un usuario
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//Middleware Pre-save: Hashear la contraseña antes de guardar
UserSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password')) { // Solo hashear si la contraseña ha sido modificada
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

//Método de instancia: Comparar contraseña
UserSchema.methods.matchPassword = async function(this: IUser, enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Exporta el modelo de usuario
export default mongoose.model<IUser>('User', UserSchema);