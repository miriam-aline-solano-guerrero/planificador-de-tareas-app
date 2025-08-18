import { Request, Response } from 'express';
import Task, { ITask } from '../models/Task';
import User from '../models/User';
import Role from '../models/Role';
import mongoose, { Schema } from 'mongoose';

//interfaz de la solicitud autenticada
interface AuthenticatedRequest extends Request {
     user?: {
        _id: Schema.Types.ObjectId;
         role: Schema.Types.ObjectId;
    };
}

//obtener todas las tareas
export const getTasks = async (req: AuthenticatedRequest, res: Response) => {
    try {
    const userId = req.user?._id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      return res.status(401).json({ message: 'No autorizado, (no hay usuario o rol)' });
    }

    const userRoleDoc = await Role.findById(userRole);
    const isAdmin = userRoleDoc?.name === 'admin';

    let query = {};

    if (!isAdmin) {
      query = {
        $or: [
          { user: userId },
          { assignedTo: userId }
        ]
      };
    }

    const tasks = await Task.find(query)
      .populate('user', 'name email')
      .populate('assignedTo', 'name email')
      .populate('dependencies', 'title completed'); // buscar tambien dependencias
        
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las tareas.' });
  }
};

//obtener tarea
export const getTask = async (req: AuthenticatedRequest, res: Response) => {
   try {
    const userId = req.user?._id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ message: 'No autorizado, no hay usuario.' });
    }

    const task = await Task.findById(req.params.id)
      .populate('user', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('dependencies', 'title completed'); 

    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada.' });
    }
    
    const userRoleDoc = await Role.findById(userRole);
    const isAdmin = userRoleDoc?.name === 'admin';
    
    const isOwner = task.user?._id.toString() === userId.toString();
    const isAssigned = task.assignedTo?.some(u => u._id.toString() === userId.toString());

    if (!isAdmin && !isOwner && !isAssigned) {
      return res.status(403).json({ message: 'No tienes permiso para ver esta tarea.' });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error('Error al obtener la tarea:', error);
    res.status(500).json({ message: 'Error al obtener la tarea.' });
  }
};

//crear tareas
export const createTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, activities, dueDate, assignedTo, dependencies } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'No autorizado, no hay usuario.' });
    }
    
    const activityObjects = (activities || []).map((name: string) => ({ name, completed: false }));

    const newTask = new Task({
      title,
      description,
      user: userId,
      activities: activityObjects,
      dueDate,
      assignedTo,
      dependencies, //guardar dependencias al crear
    });

    const createdTask = await newTask.save();
    res.status(201).json(createdTask);
  } catch (error) {
    console.error('Error al crear la tarea:', error);
    res.status(500).json({ message: 'Error al crear la tarea.' });
  }
};

//actualzar tareas
export const updateTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const userRole = req.user?.role;
    const { completed, ...updateData } = req.body; 

    // Buscamos la tarea y las dependencias para poder acceder a su estado
    const task = await Task.findById(req.params.id).populate('dependencies');
    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada.' });
    }

    const roleDoc = await Role.findById(userRole);
    const isAdmin = roleDoc?.name === 'admin';
    const isOwner = task.user?.toString() === userId?.toString();
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'No tienes permiso para editar esta tarea.' });
    }
    
    //Si se intenta marcar como completada, se valida y se detiene si hay errores.
    if (completed === true) {
      const populatedDependencies = task.dependencies as unknown as ITask[];
      const incompleteDependencies = populatedDependencies.filter(dep => !dep.completed);
      
      if (incompleteDependencies.length > 0) {
        return res.status(400).json({
          message: 'No se puede completar esta tarea. Primero debes completar las tareas dependientes.',
          incompleteTasks: incompleteDependencies.map(dep => dep.title)
        });
      }
    }
        
        Object.assign(task, updateData);
        if (completed !== undefined) {
            task.completed = completed;
        }

        if (updateData.activities) {
            const newActivityObjects = updateData.activities.map((name: string) => {
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

//eliminar tareas
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

//actualizar status de actividades
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