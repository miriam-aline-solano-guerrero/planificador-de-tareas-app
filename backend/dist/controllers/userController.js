"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUserById = exports.getUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * @desc    Obtener todos los usuarios
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getUsers = async (req, res) => {
    try {
        const users = await User_1.default.find({}).select('-password');
        res.status(200).json(users);
    }
    catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error del servidor al obtener usuarios.' });
    }
};
exports.getUsers = getUsers;
/**
 * @desc    Obtener un usuario por ID
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
const getUserById = async (req, res) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
        res.status(400).json({ message: 'ID de usuario no válido.' });
        return;
    }
    try {
        const user = await User_1.default.findById(req.params.id).select('-password');
        if (!user) {
            res.status(404).json({ message: 'Usuario no encontrado.' });
            return;
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.error('Error al obtener usuario por ID:', error);
        res.status(500).json({ message: 'Error del servidor al obtener usuario.' });
    }
};
exports.getUserById = getUserById;
/**
 * @desc    Actualizar usuario (por Admin)
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
const updateUser = async (req, res) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
        res.status(400).json({ message: 'ID de usuario no válido.' });
        return;
    }
    const { username, email, role } = req.body;
    const currentUser = req.user; // El usuario que está haciendo la petición
    try {
        const userToUpdate = await User_1.default.findById(req.params.id);
        if (!userToUpdate) {
            res.status(404).json({ message: 'Usuario no encontrado.' });
            return;
        }
        // Validaciones de seguridad para administradores
        if (currentUser && currentUser._id.toString() === userToUpdate._id.toString() && role && role !== 'admin') {
            const adminCount = await User_1.default.countDocuments({ role: 'admin' });
            if (adminCount === 1) {
                res.status(400).json({ message: 'No puedes degradar al único administrador del sistema.' });
                return;
            }
        }
        if (username !== undefined)
            userToUpdate.username = username;
        if (email !== undefined)
            userToUpdate.email = email;
        const validRoles = ['user', 'admin', 'editor', 'viewer', 'project_manager'];
        if (role !== undefined) {
            if (validRoles.includes(role)) {
                userToUpdate.role = role;
            }
            else {
                res.status(400).json({ message: 'Rol proporcionado no válido.' });
                return;
            }
        }
        await userToUpdate.save();
        res.json({
            _id: userToUpdate._id,
            username: userToUpdate.username,
            email: userToUpdate.email,
            role: userToUpdate.role,
        });
    }
    catch (error) {
        console.error('Error al actualizar usuario:', error);
        if (error.code === 11000) {
            res.status(400).json({ message: 'El email o nombre de usuario ya está en uso.' });
            return;
        }
        res.status(500).json({ message: 'Error del servidor al actualizar usuario.' });
    }
};
exports.updateUser = updateUser;
/**
 * @desc    Eliminar usuario (por Admin)
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
        res.status(400).json({ message: 'ID de usuario no válido.' });
        return;
    }
    const currentUser = req.user;
    try {
        const userToDelete = await User_1.default.findById(req.params.id);
        if (!userToDelete) {
            res.status(404).json({ message: 'Usuario no encontrado.' });
            return;
        }
        // Validaciones de seguridad
        if (currentUser && currentUser._id.toString() === userToDelete._id.toString()) {
            res.status(400).json({ message: 'No puedes eliminar tu propia cuenta a través de esta interfaz de administración.' });
            return;
        }
        if (userToDelete.role === 'admin') {
            const adminCount = await User_1.default.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                res.status(400).json({ message: 'No puedes eliminar al único administrador del sistema.' });
                return;
            }
        }
        await User_1.default.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: 'Usuario eliminado exitosamente.' });
    }
    catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ message: 'Error del servidor al eliminar usuario.' });
    }
};
exports.deleteUser = deleteUser;
