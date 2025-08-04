import mongoose, { Document, Schema, Types } from 'mongoose';

// Define la interfaz para el documento de tarea
export interface ITask extends Document {
  title: string;
  description: string;
  activities?: string[]; // Array de strings para sub-tareas
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;         // Fecha de entrega (opcional)
  user: Types.ObjectId;   // Referencia al usuario que creó la tarea
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
  activities: [{
    type: String,
  }],
  completed: {
    type: Boolean,
    default: false,
  },
  assignedTo: [{ // Campo para el array de referencias a usuarios asignados
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // También hace referencia al modelo 'User'
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
  timestamps: true, // Añade automáticamente 'createdAt' y 'updatedAt'
});

// Exporta el modelo de tarea
export default mongoose.model<ITask>('Task', TaskSchema);