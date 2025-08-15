import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IActivity {
  _id?: Types.ObjectId;
  name: string;
  completed: boolean;
}

export interface ITask extends Document {
  user: Types.ObjectId;
  title: string;
  description?: string;
  activities: IActivity[];
  completed: boolean;
  dueDate?: Date;
  assignedTo?: Types.ObjectId[];
  dependencies: Schema.Types.ObjectId[]; // arreglo de IDS de tareas creadas
}

const TaskSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    activities: [
      {
        name: { type: String, required: true },
        completed: { type: Boolean, default: false },
      }
    ],
    completed: {
      type: Boolean,
      default: false,
    },
    dueDate: {
      type: Date,
    },
    assignedTo: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    dependencies: [{
      type: Schema.Types.ObjectId, 
      ref: 'Task',
    }]
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITask>('Task', TaskSchema);