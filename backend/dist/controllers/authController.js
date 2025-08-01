"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfile = exports.loginUser = exports.registerUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Función auxiliar para generar el token JWT
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h', // Token expira en 1 hora
    });
};
/**
 * @desc    Registrar un nuevo usuario
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        res.status(400).json({ message: 'Por favor, introduce todos los campos.' });
        return;
    }
    try {
        const userExists = await User_1.default.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            res.status(400).json({ message: 'El usuario o email ya existe.' });
            return;
        }
        const user = await User_1.default.create({
            username,
            email,
            password,
        });
        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        }
        else {
            res.status(400).json({ message: 'Datos de usuario no válidos.' });
        }
    }
    catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ message: 'Error del servidor al registrar usuario.' });
    }
};
exports.registerUser = registerUser;
/**
 * @desc    Autenticar usuario y obtener token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: 'Por favor, introduce el email y la contraseña.' });
        return;
    }
    try {
        const user = await User_1.default.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            res.status(200).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        }
        else {
            res.status(401).json({ message: 'Credenciales inválidas.' });
        }
    }
    catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ message: 'Error del servidor al iniciar sesión.' });
    }
};
exports.loginUser = loginUser;
/**
 * @desc    Obtener perfil del usuario actual
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getUserProfile = async (req, res) => {
    const user = req.user; // El usuario ya está adjunto por el middleware 'protect'
    if (user) {
        res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
        });
    }
    else {
        res.status(404).json({ message: 'Usuario no encontrado.' });
    }
};
exports.getUserProfile = getUserProfile;
