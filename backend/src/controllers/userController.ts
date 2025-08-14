import { Request, Response } from "express";
import mongoose, { Schema } from "mongoose";
import User, { IUser } from '../models/User';
import Role from "../models/Role";

// Definimos la interfaz para la solicitud autenticada, que contiene el ID de usuario y el ID de rol
// Esta interfaz debe ser consistente con la de `authMiddleware.ts` y `permissionMiddleware.ts`
interface AuthenticatedRequest extends Request {
    user?: {
        _id: Schema.Types.ObjectId;
        role: Schema.Types.ObjectId;
    };
}

/**
 * @desc    Obtener todos los usuarios (solo para administradores)
 * @route   GET /api/users
 * @access  Private (manage_users)
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

/**
 * @desc    Actualizar el rol de un usuario (solo para administradores)
 * @route   PUT /api/users/:id/role
 * @access  Private (manage_users)
 */
export const updateUserRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { roleId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(roleId)) {
        res.status(400).json({ message: 'ID de usuario o de rol no válido.' });
        return;
    }

    try {
        const newRole = await Role.findById(roleId);
        if (!newRole) {
            res.status(404).json({ message: 'El rol especificado no existe.' });
            return;
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { role: newRole._id },
            { new: true, runValidators: true }
        )
        .select('_id name email role')
        .populate('role', 'name');

        if (!updatedUser) {
            res.status(404).json({ message: 'Usuario no encontrado.' });
            return;
        }

        res.status(200).json(updatedUser);
    } catch (error: any) {
        console.error('Error al actualizar el rol del usuario:', error);
        res.status(500).json({ message: 'Error del servidor al actualizar el rol.' });
    }
};

/**
 * @desc    Actualizar un usuario (solo el dueño o un admin)
 * @route   PUT /api/users/:id
 * @access  Private
 */
export const updateUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400).json({ message: 'ID de usuario no válido.' });
        return;
    }

    const { name, email } = req.body;
    const userId = req.user?._id;

    try {
        const userToUpdate = await User.findById(req.params.id);
        if (!userToUpdate) {
            res.status(404).json({ message: 'Usuario no encontrado.' });
            return;
        }

        const isOwner = userToUpdate._id.toString() === userId?.toString();
        
        if (!isOwner) {
            res.status(403).json({ message: 'No tienes permiso para actualizar este usuario.' });
            return;
        }

        if (name !== undefined) userToUpdate.name = name;
        if (email !== undefined) userToUpdate.email = email;
        
        await userToUpdate.save();

        res.json({
            _id: userToUpdate._id,
            name: userToUpdate.name,
            email: userToUpdate.email,
            role: userToUpdate.role,
        });

    } catch (error: any) {
        console.error('Error al actualizar el usuario:', error);
        res.status(500).json({ message: 'Error del servidor al actualizar el usuario.' });
    }
};

/**
 * @desc    Eliminar un usuario (solo el dueño o un admin)
 * @route   DELETE /api/users/:id
 * @access  Private
 */
export const deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400).json({ message: 'ID de usuario no válido.' });
        return;
    }
    
    const userId = req.user?._id;

    try {
        const userToDelete = await User.findById(req.params.id);

        if (!userToDelete) {
            res.status(404).json({ message: 'Usuario no encontrado.' });
            return;
        }
        
        const isOwner = userToDelete._id.toString() === userId?.toString();
        
        if (!isOwner) {
            res.status(403).json({ message: 'No tienes permiso para eliminar este usuario.' });
            return;
        }

        await User.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: 'Usuario eliminado exitosamente.' });

    } catch (error: any) {
        console.error('Error al eliminar el usuario:', error);
        res.status(500).json({ message: 'Error del servidor al eliminar el usuario.' });
    }
};