import { Schema, model, Document } from 'mongoose';
export interface Task extends Document {
	titulo: string;
	descripcion?: string;
	check: boolean;
	creacion: Date;
}
const EsquemaTarea = new Schema<Task>({
	titulo: {
    	type: String,
    	required: true,
    	trim: true,
    	minlength: 2
	},
	descripcion: {
    	type: String,
    	required: false,
    	trim: true
	},
	check: {
    	type: Boolean,
    	default: false
	},
	creacion: {
    	type: Date,
    	default: Date.now
	}
}, {
	timestamps: true
});
export default model<Task>('Task', EsquemaTarea);
