import { Request, Response } from "express";
import mongoose from "mongoose";
import User, {IUser} from '../models/User'
import Role from "../models/Role";

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

/**
 * @desc    Obtener todos los usuarios
 * @route   GET /api/users
 * @access  Public
 */
export const getUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find({})
    .select('_id name email role')
    .populate('role', 'name');
    res.status(200).json(users);
  } catch (error: any) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error del servidor al obtener usuarios.' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ message: 'ID de usuario no válido.' });
    return;
  }

  const { email, role } = req.body; 

  try {
    const userToUpdate = await User.findById(req.params.id);

    if (!userToUpdate) {
      res.status(404).json({ message: 'Usuario no encontrado.' });
      return;
    }

    if (email !== undefined) userToUpdate.email = email;
    if (role !== undefined) userToUpdate.role = role;
    
    await userToUpdate.save();

    res.json({
      _id: userToUpdate._id,
      email: userToUpdate.email,
      role: userToUpdate.role,
    });

  } catch (error: any) {
    // ...
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400).json({ message: 'ID de usuario no válido.' });
        return;
    }

    try {
        const userToDelete = await User.findById(req.params.id);

        if (!userToDelete) {
            res.status(404).json({ message: 'Usuario no encontrado.' });
            return;
        }
        await User.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: 'Usuario eliminado exitosamente.' });
    } catch (error: any) {
        // ...
  }
};