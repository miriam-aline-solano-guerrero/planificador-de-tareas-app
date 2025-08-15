import { Request, Response } from 'express';
import Role from '../models/Role';
import mongoose from 'mongoose';

const ALL_PERMISSIONS = [
    'read_users',
    'create_users',
    'update_users',
    'delete_users',
    'read_roles',
    'create_roles',
    'update_roles',
    'delete_roles',
    'read_tasks',
    'create_tasks',
    'update_tasks',
    'delete_tasks'
];

export const getAllPermissions = (req: Request, res: Response) => {
    res.status(200).json(ALL_PERMISSIONS);
};

export const getRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    const roles = await Role.find({});
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al obtener roles.' });
  }
};

export const createRole = async (req: Request, res: Response): Promise<void> => {
  const { name, permissions } = req.body;
  if (!name || !permissions) {
    res.status(400).json({ message: 'El nombre y los permisos son obligatorios.' });
    return;
  }
  try {
    const newRole = await Role.create({ name, permissions });
    res.status(201).json(newRole);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'El nombre del rol ya existe.' });
    } else {
      res.status(500).json({ message: 'Error del servidor al crear el rol.' });
    }
  }
};

export const updateRole = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, permissions } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: 'ID de rol no válido.' });
    return;
  }
  try {
    const updatedRole = await Role.findByIdAndUpdate(
      id,
      { name, permissions },
      { new: true, runValidators: true }
    );
    if (!updatedRole) {
      res.status(404).json({ message: 'Rol no encontrado.' });
      return;
    }
    res.status(200).json(updatedRole);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al actualizar el rol.' });
  }
};

export const deleteRole = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: 'ID de rol no válido.' });
    return;
  }
  try {
    const roleToDelete = await Role.findById(id);
    if (!roleToDelete) {
      res.status(404).json({ message: 'Rol no encontrado.' });
      return;
    }
    await Role.deleteOne({ _id: id });
    res.status(200).json({ message: 'Rol eliminado exitosamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al eliminar el rol.' });
  }
};