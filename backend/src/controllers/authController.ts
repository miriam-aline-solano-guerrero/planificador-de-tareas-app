import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import Role from '../models/Role';
import mongoose from 'mongoose';


/**
 * @desc    Registrar un nuevo usuario y asignarle un rol específico
 * @route   POST /api/auth/register
 * @access  Private (idealmente, solo accesible por administradores)
 */
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  // Ahora esperamos un roleId en el cuerpo de la petición
  const { email, password, roleId } = req.body;

  if (!email || !password || !roleId) {
    res.status(400).json({ message: 'Por favor, introduce un email, una contraseña y un ID de rol.' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(roleId)) {
    res.status(400).json({ message: 'El ID de rol proporcionado no es válido.' });
    return;
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ message: 'El usuario ya existe.' });
      return;
    }

    // Verifica que el ID de rol sea válido y que el rol exista
    const roleExists = await Role.findById(roleId);

    if (!roleExists) {
      res.status(404).json({ message: 'El rol con el ID proporcionado no fue encontrado.' });
      return;
    }

    const user = await User.create({
      email,
      password,
      role: roleId, // <-- Asignamos el ID de rol que vino en la petición
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(400).json({ message: 'Datos de usuario no válidos.' });
    }
  } catch (error: any) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error del servidor durante el registro.' });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Por favor, introduce el email y la contraseña.' });
    return;
  }

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.status(200).json({
        _id: user._id,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(401).json({ message: 'Credenciales inválidas.' });
    }
  } catch (error: any) {
    console.error('Error al iniciar sesión:', error); 
    res.status(500).json({ message: 'Error del servidor al iniciar sesión.' });
  }
};