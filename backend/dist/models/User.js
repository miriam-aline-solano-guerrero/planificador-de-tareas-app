"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Define el esquema de Mongoose para el usuario
const UserSchema = new mongoose_1.default.Schema({
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
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) { // Solo hashear si la contraseña ha sido modificada
        return next();
    }
    const salt = await bcryptjs_1.default.genSalt(10);
    this.password = await bcryptjs_1.default.hash(this.password, salt);
    next();
});
// Método de instancia: Comparar contraseña
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcryptjs_1.default.compare(enteredPassword, this.password);
};
// Exporta el modelo de usuario
exports.default = mongoose_1.default.model('User', UserSchema);
