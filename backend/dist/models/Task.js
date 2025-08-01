"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// Define el esquema de Mongoose para la tarea
const TaskSchema = new mongoose_1.default.Schema({
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
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // Establece la relación con el modelo 'User'
    },
    assignedTo: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User', // También hace referencia al modelo 'User'
        }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    dueDate: {
        type: Date,
        required: false, // Es opcional
    },
}, {
    timestamps: true, // Añade automáticamente 'createdAt' y 'updatedAt'
});
// Exporta el modelo de tarea
exports.default = mongoose_1.default.model('Task', TaskSchema);
