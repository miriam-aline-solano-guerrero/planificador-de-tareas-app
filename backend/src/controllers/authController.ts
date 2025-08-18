import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import Role, { IRole } from '../models/Role'; 
import { Schema, Types } from 'mongoose';

// Interfaz que define la estructura de la respuesta que se envía después de un registro o inicio de sesión exitoso.
interface UserResponse {
    _id: Schema.Types.ObjectId;
    name: string;
    email: string;
    role: {
        _id: Schema.Types.ObjectId;// El ID del rol en formato ObjectId.
        name: string;// El nombre del rol (ej. "user", "admin").
    };
    token: string;// El token JWT generado para la sesión del usuario.
}

// Función para generar un token JWT.
// Recibe el ID del usuario y el ID del rol para incluirlos en el token.
const generateToken = (id: string, roleId: string): string => {
    return jwt.sign({ id, roleId }, process.env.JWT_SECRET as string, {
        expiresIn: '1d',
    });
};

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    console.log('[DEBUG] Datos recibidos en el controlador:', req.body);

    const { name, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            console.log('[DEBUG] Usuario ya existe. Mensaje: 400.');
            res.status(400).json({ message: 'El usuario ya existe.' });
            return;
        }

        //tipado explícito para Mongoose
        const defaultRole = await Role.findOne({ name: 'user' }) as IRole & { _id: Types.ObjectId };

        if (!defaultRole) {
            console.log('[DEBUG] Error: Rol "admin" no encontrado.');
            res.status(500).json({ message: 'Error: El rol por defecto no se encontró.' });
            return;
        }

        const user = await User.create({
            name,
            email,
            password: password,
            role: defaultRole._id, 
        });

        if (!user) {
            console.log('[DEBUG] No se pudo crear el usuario.');
            res.status(500).json({ message: 'Error interno: no se pudo crear el usuario.' });
            return;
        }

        const token = generateToken(user._id.toString(), defaultRole._id.toString());
        
        console.log('[DEBUG] Usuario registrado exitosamente. Enviando respuesta 201.');

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: {
                _id: defaultRole._id,
                name: defaultRole.name
            },
            token,
        });
    } catch (error: any) {
        console.error('[ERROR] Error al registrar usuario:', error);
        
        if (error.name === 'ValidationError') {
            console.error('[DETALLES] Error de validación de Mongoose:', error.errors);
        } else if (error.code === 11000) {
             console.error('[DETALLES] Error de clave duplicada (E11000). El email ya existe.');
        }
        
        res.status(500).json({ message: 'Error al registrar el usuario.' });
    }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).populate<{ role: { _id: Schema.Types.ObjectId, name: string } }>('role');

        if (!user) {
            res.status(401).json({ message: 'Credenciales de acceso no válidas.' });
            return;
        }

        const isMatch = (password === user.password);

        if (!isMatch) {
            res.status(401).json({ message: 'Credenciales de acceso no válidas.' });
            return;
        }

        const token = generateToken(user._id.toString(), user.role._id.toString());

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: {
                _id: user.role._id,
                name: user.role.name
            },
            token,
        });
    } catch (error: any) {
        console.error('Error en el login:', error);
        res.status(500).json({ message: 'Error del servidor durante el inicio de sesión.' });
    }
};