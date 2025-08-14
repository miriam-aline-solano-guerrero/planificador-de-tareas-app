import { Request, Response } from 'express';
import Task from '../models/Task';
import User, { IUser } from '../models/User'; // Importamos IUser para el tipo
import Role from '../models/Role'; // <--- Importamos el modelo de Role
import mongoose from 'mongoose';
import { Schema } from 'mongoose';

// Definimos la interfaz de la solicitud autenticada
interface AuthenticatedRequest extends Request {
    user?: {
        _id: Schema.Types.ObjectId;
        name: string;
        email: string;
        role: Schema.Types.ObjectId;
    };
}

export const getTasks = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            res.status(401).json({ message: 'No autorizado, no hay usuario.' });
            return;
        }

        const tasks = await Task.find({
            $or: [
                { user: userId },
                { assignedTo: userId }
            ]
        })
        .populate('user', 'name email role')
        .populate('assignedTo', 'name email role');

        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error al obtener las tareas:', error);
        res.status(500).json({ message: 'Error al obtener las tareas.' });
    }
};

export const getTask = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            res.status(401).json({ message: 'No autorizado, no hay usuario.' });
            return;
        }

        const task = await Task.findById(req.params.id)
            .populate('user', 'name email role')
            .populate('assignedTo', 'name email role');

        if (!task) {
            res.status(404).json({ message: 'Tarea no encontrada.' });
            return;
        }

        const assignedToUserIds = task.assignedTo?.map(u => u._id.toString()) || [];

        const isOwner = task.user?._id.toString() === userId.toString();
        const isAssigned = assignedToUserIds.includes(userId.toString());

        if (!isOwner && !isAssigned) {
            res.status(403).json({ message: 'No tienes permiso para ver esta tarea.' });
            return;
        }

        res.status(200).json(task);
    } catch (error) {
        console.error('Error al obtener la tarea:', error);
        res.status(500).json({ message: 'Error al obtener la tarea.' });
    }
};

export const createTask = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { title, description, activities, dueDate, assignedTo } = req.body;
        const userId = req.user?._id;
        if (!userId) {
            res.status(401).json({ message: 'No autorizado, no hay usuario.' });
            return;
        }
        
        const activityObjects = (activities || []).map((name: string) => ({ name, completed: false }));

        const newTask = new Task({
            title,
            description,
            user: userId,
            activities: activityObjects,
            dueDate,
            assignedTo,
        });
        const createdTask = await newTask.save();
        res.status(201).json(createdTask);
    } catch (error) {
        console.error('Error al crear la tarea:', error);
        res.status(500).json({ message: 'Error al crear la tarea.' });
    }
};

// **Función para actualizar una tarea (CORREGIDA)**
export const updateTask = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        const userRole = req.user?.role;
        const { title, description, activities, dueDate, assignedTo, completed } = req.body;

        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Tarea no encontrada.' });
        }

        const roleDoc = await Role.findById(userRole);
        const isAdmin = roleDoc?.name === 'admin';
        const isOwner = task.user?.toString() === userId?.toString();
        
         // --- LÍNEAS DE DEPURACIÓN AGREGADAS ---
        console.log('--- Verificación de Permisos para updateTask ---');
        console.log('ID del Usuario (token):', userId?.toString());
        console.log('ID del Dueño de la Tarea:', task.user?.toString());
        console.log('El usuario es dueño (isOwner):', isOwner);
        console.log('El usuario es administrador (isAdmin):', isAdmin);
        console.log('---------------------------------------------');
        
        // **LÓGICA DE PERMISOS:** Solo el admin o el dueño de la tarea pueden actualizarla.
        // Si el usuario no es admin y no es el dueño, denegamos el acceso.
        if (!isAdmin && !isOwner) {
            return res.status(403).json({ message: 'No tienes permiso para editar esta tarea.' });
        }
        
        // Actualiza los campos principales
        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (dueDate !== undefined) task.dueDate = dueDate;
        if (assignedTo !== undefined) task.assignedTo = assignedTo;
        if (completed !== undefined) task.completed = completed;
        
        // Manejo de actividades para no sobrescribir el estado
        if (activities) {
            const newActivityObjects = activities.map((name: string) => {
                const existingActivity = task.activities.find(a => a.name === name);
                return existingActivity ? existingActivity : { name, completed: false };
            });
            task.activities = newActivityObjects;
        }

        const updatedTask = await task.save();
        res.status(200).json(updatedTask);
    } catch (error) {
        console.error('Error al actualizar la tarea:', error);
        res.status(500).json({ message: 'Error al actualizar la tarea.' });
    }
};

// **Función para eliminar una tarea (CORREGIDA)**
export const deleteTask = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        const userRole = req.user?.role;

        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Tarea no encontrada.' });
        }
        
        const roleDoc = await Role.findById(userRole);
        const isAdmin = roleDoc?.name === 'admin';
        const isOwner = task.user?.toString() === userId?.toString();
        
        // **LÓGICA DE PERMISOS:** Solo el admin o el dueño de la tarea pueden eliminarla.
        if (!isAdmin && !isOwner) {
            return res.status(403).json({ message: 'No tienes permiso para eliminar esta tarea.' });
        }

        await Task.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: 'Tarea eliminada exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar la tarea:', error);
        res.status(500).json({ message: 'Error al eliminar la tarea.' });
    }
};

// **Función para actualizar el estado de una actividad (CORREGIDA)**
export const updateActivityStatus = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { taskId, activityId } = req.params;
        const { completed } = req.body;
        const userId = req.user?._id;
        const userRole = req.user?.role;

        if (!mongoose.Types.ObjectId.isValid(taskId) || !mongoose.Types.ObjectId.isValid(activityId)) {
            return res.status(400).json({ message: 'ID de tarea o actividad no válido.' });
        }

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Tarea no encontrada.' });
        }

        const roleDoc = await Role.findById(userRole);
        const isAdmin = roleDoc?.name === 'admin';
        const isOwner = task.user?.toString() === userId?.toString();
        const isAssigned = task.assignedTo?.some(id => id.toString() === userId?.toString());

        // **LÓGICA DE PERMISOS:** El admin, el dueño o el usuario asignado pueden actualizar el estado.
        if (!isAdmin && !isOwner && !isAssigned) {
            return res.status(403).json({ message: 'No tienes permiso para actualizar esta tarea.' });
        }

        const activity = task.activities.find(a => a._id && a._id.toString() === activityId);
        if (!activity) {
            return res.status(404).json({ message: 'Actividad no encontrada.' });
        }

        activity.completed = completed;
        await task.save();

        res.status(200).json(task);
    } catch (error) {
        console.error('Error al actualizar el estado de la actividad:', error);
        res.status(500).json({ message: 'Error del servidor.' });
    }
};