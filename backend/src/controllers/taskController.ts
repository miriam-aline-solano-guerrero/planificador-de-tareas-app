import { Request, Response } from 'express';
import Task from '../models/Task';
import { IUser } from '../models/User';

// Extiende la interfaz de Request para incluir el objeto 'user'
interface AuthenticatedRequest extends Request {
    user?: IUser;
}

//obtener todas las tareas
export const getTasks = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'No autorizado, no hay usuario.' });
            return;
        }

        const tasks = await Task.find({ user: userId });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las tareas.' });
    }
};

//tareas especificas por usuario
export const getTask = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const task = await Task.findById(req.params.id);

        if (!task || task.user?.toString() !== userId?.toString()) {
            res.status(404).json({ message: 'Tarea no encontrada o no pertenece al usuario.' });
            return;
        }

        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la tarea.' });
    }
};

//crear una nueva tarea
export const createTask = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { title, description, activities, dueDate, assignedTo} = req.body;
        const userId = req.user?._id;

        if (!userId) {
            res.status(401).json({ message: 'No autorizado, no hay usuario.' });
            return;
        }

        const newTask = new Task({
            title,
            description,
            user: userId,
            activities,
            dueDate,
            assignedTo,
        });

        const createdTask = await newTask.save();
        res.status(201).json(createdTask);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear la tarea.' });
    }
};

//actualizar una tarea
export const updateTask = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const task = await Task.findById(req.params.id);

        if (!task || task.user?.toString() !== userId?.toString()) {
            res.status(404).json({ message: 'Tarea no encontrada o no pertenece al usuario.' });
            return;
        }

        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la tarea.' });
    }
};

//eliminar tareas
export const deleteTask = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const task = await Task.findById(req.params.id);

        if (!task || task.user?.toString() !== userId?.toString()) {
            res.status(404).json({ message: 'Tarea no encontrada o no pertenece al usuario.' });
            return;
        }

        await Task.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Tarea eliminada exitosamente.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la tarea.' });
    }
};