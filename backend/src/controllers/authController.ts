// backend/src/controllers/authController.ts

import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

const JWT_SECRET: string = 'tu_secreto_super_seguro_y_largo_aqui_para_produccion_12345'; // Asegúrate de que tenga un valor STRING

const generateToken = (id: Types.ObjectId): string => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '1h',
  });
};

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password } = req.body;

  if (!username) {
    res.status(400).json({ message: 'El campo username es requerido.' });
    return;
  }
  if (!email) {
    res.status(400).json({ message: 'El campo email es requerido.' });
    return;
  }
  if (!password) {
    res.status(400).json({ message: 'El campo password es requerido.' });
    return;
  }

  try {
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      res.status(400).json({ message: 'El usuario o email ya existe.' });
      return;
    }

    const user: IUser = await User.create({
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
    } else {
      res.status(400).json({ message: 'Datos de usuario no válidos.' });
    }
  } catch (error: any) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error del servidor al registrar usuario.' });
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
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Credenciales inválidas.' });
    }
  } catch (error: any) {
    console.error('Error al iniciar sesión:', error); // Agrega este log para ver si entra aquí
    res.status(500).json({ message: 'Error del servidor al iniciar sesión.' });
  }
};

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  const user = req.user;

  if (user) {
    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(404).json({ message: 'Usuario no encontrado.' });
  }
};