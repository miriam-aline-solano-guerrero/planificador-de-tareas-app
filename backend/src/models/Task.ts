import mongoose, { Document, Schema, Types } from 'mongoose';

interface ITask extends Document {
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;
  user: Types.ObjectId; // Referencia al usuario que creó la tarea
  activities?: string[]; // Asegurarse de que 'activities' sea opcional o tenga un tipo claro
  assignedTo?: Types.ObjectId[]; // Array de referencias a usuarios asignados
}

// Define el esquema de Mongoose para la tarea
const TaskSchema: Schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  activities: [{ // Campo de actividades
    type: String,
  }],
  completed: {
    type: Boolean,
    default: false,
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Hace referencia al modelo 'User'
    required: true, // Una tarea debe tener un usuario asociado
  },
  assignedTo: [{ // Campo para el array de referencias a usuarios asignados
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
  }],
  createdAt: { // Fecha de creación de la tarea (Mongoose también añade 'updatedAt' si usas timestamps)
    type: Date,
    default: Date.now,
  },
  dueDate: { // Nuevo campo: Fecha de entrega
    type: Date,
    required: false, // Es opcional
  },
}, {
  //timestamps: true, // Añade automáticamente 'createdAt' y 'updatedAt'
});

// Exporta el modelo de tarea
export default mongoose.model<ITask>('Task', TaskSchema);