import { Request, Response } from 'express';
import Task, { ITask } from '../models/Task';
import { IUser } from '../models/User';
import mongoose from 'mongoose';

interface AuthenticatedRequest extends Request {
    user?: IUser;
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
        }).populate('user', 'name role').populate('assignedTo', 'name role');
        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error al obtener las tareas:', error);
        res.status(500).json({ message: 'Error al obtener las tareas.' });
    }
};

export const getTask = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        const task = await Task.findById(req.params.id);
        if (!task || task.user?.toString() !== userId?.toString()) {
            res.status(404).json({ message: 'Tarea no encontrada o no pertenece al usuario.' });
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

export const updateTask = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        const { title, description, activities, dueDate, assignedTo, completed } = req.body;

        const task = await Task.findById(req.params.id);
        if (!task || task.user?.toString() !== userId?.toString()) {
            res.status(404).json({ message: 'Tarea no encontrada o no pertenece al usuario.' });
            return;
        }
        
        // Actualiza los campos principales
        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (dueDate !== undefined) task.dueDate = dueDate;
        if (assignedTo !== undefined) task.assignedTo = assignedTo;
        if (completed !== undefined) task.completed = completed;
        
        // Manejo de actividades para no sobrescribir el estado
        if (activities) {
            const currentActivityNames = task.activities.map(a => a.name);
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

// <-- NUEVA FUNCIÓN PARA ACTUALIZAR EL ESTADO DE UNA ACTIVIDAD
export const updateActivityStatus = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { taskId, activityId } = req.params;
        const { completed } = req.body;
        const userId = req.user?._id;

        if (!mongoose.Types.ObjectId.isValid(taskId) || !mongoose.Types.ObjectId.isValid(activityId)) {
            return res.status(400).json({ message: 'ID de tarea o actividad no válido.' });
        }

        const task = await Task.findById(taskId);

        if (!task || (task.user?.toString() !== userId?.toString() && !task.assignedTo?.some(id => id.toString() === userId?.toString()))) {
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

export const deleteTask = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        const task = await Task.findById(req.params.id);
        if (!task || task.user?.toString() !== userId?.toString()) {
            res.status(404).json({ message: 'Tarea no encontrada o no pertenece al usuario.' });
            return;
        }
        await Task.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Tarea eliminada exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar la tarea:', error);
        res.status(500).json({ message: 'Error al eliminar la tarea.' });
    }
};