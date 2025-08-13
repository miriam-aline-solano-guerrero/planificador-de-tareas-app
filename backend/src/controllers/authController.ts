import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

//funcion para generar el token
const generateToken = (id: string): string => {
    return jwt.sign({ id }, process.env.JWT_SECRET as string, {
        expiresIn: '1d',
    });
};

//registrar usuario
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  //parametros que se solicitan si o si
    const { email, password, roleId } = req.body;
    console.log('Recibido del frontend:', { email, password });

    try {
      //si el usuario existe, lo busca por el email...
        const userExists = await User.findOne({ email });

        //se valida y se regresa codigo 400 de que el usuario ya existe
        if (userExists) {
            res.status(400).json({ message: 'El usuario ya existe.' });
            return;
        }

        //si no existe se crea, pero debe tener los 3 parametros
        const user = await User.create({
            email,
            password,
            role: roleId,
        });

        // Verificación agregada para asegurar que 'user' no sea null
        if (!user) {
            res.status(500).json({ message: 'Error interno: no se pudo crear el usuario.' });
            return;
        }
        
        //se genera el token para el usuario registrado
        const token = generateToken(user.id.toString());
        
        //se devuelve un status del usuario con sus datos
        res.status(201).json({
            _id: user._id,
            email: user.email,
            role: (user.role as any).name,
            token,
        });
    } catch (error: any) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ message: 'Error al registrar el usuario.' });
    }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).populate('role');

        if (!user) {
            res.status(401).json({ message: 'Credenciales de acceso no válidas.' });
            return;
        }

        console.log('Contraseña del formulario:', password);
        console.log('Contraseña de la base de datos (hash):', user.password);

        const isMatch = await bcrypt.compare(password, user.password as string);
        if (!isMatch) {
            res.status(401).json({ message: 'Credenciales de acceso no válidas.' });
            return;
        }

        const token = generateToken(user.id.toString());

        res.status(200).json({
            _id: user._id,
            email: user.email,
            role: (user.role as any).name,
            token,
        });
    } catch (error: any) {
        console.error('Error en el login:', error);
        res.status(500).json({ message: 'Error del servidor durante el inicio de sesión.' });
    }
};