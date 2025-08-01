import { Request, Response } from 'express';
import Task, { ITask } from '../models/Task';
import mongoose, { PopulateOptions } from 'mongoose';
import { IUser } from '../models/User';

// --- Declaración Global para req.user (se mantiene para claridad) ---
// Idealmente, esta declaración solo debe estar en un lugar (ej. authMiddleware.ts o un archivo .d.ts)
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// Opciones de Populate reutilizables para 'user' y 'assignedTo'
const userPopulateOptions: PopulateOptions = {
  path: 'user',
  select: 'username email',
};

const assignedToPopulateOptions: PopulateOptions = {
  path: 'assignedTo',
  select: 'username email',
};

/**
 * @desc    Obtener todas las tareas del usuario actual o en las que participa (Admin ve todas)
 * @route   GET /api/tareas
 * @access  Private (requiere autenticación)
 */
export const getTasks = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?._id;
  const userRole = req.user?.role;

  if (!userId) {
    res.status(401).json({ message: 'Usuario no autenticado.' });
    return;
  }

  let query: any = {};

  // Si el usuario NO es 'admin', filtra las tareas
  if (userRole !== 'admin') {
    query = {
      $or: [
        { user: userId },
        { assignedTo: userId }
      ]
    };
  }

  try {
    const tasks = await Task.find(query)
                            .populate(userPopulateOptions)
                            .populate(assignedToPopulateOptions)
                            .lean() as ITask[];

    res.status(200).json(tasks);
  } catch (error: any) {
    console.error("Error al obtener las tareas:", error);
    res.status(500).json({ message: 'Error del servidor al obtener tareas.', error: error.message });
  }
};

/**
 * @desc    Crear una nueva tarea
 * @route   POST /api/tareas
 * @access  Private (roles permitidos en la ruta)
 */
export const createTask = async (req: Request, res: Response): Promise<void> => {
  const { title, description, activities, assignedTo, dueDate } = req.body;
  const userId = req.user?._id;

  if (!title || !description) {
    res.status(400).json({ message: 'El título y la descripción son obligatorios.' });
    return;
  }

  if (!userId) {
      res.status(401).json({ message: 'Usuario no autenticado para crear tarea.' });
      return;
  }

  try {
    const createdTask: ITask = await Task.create({
      title,
      description,
      activities,
      user: userId,
      assignedTo,
      dueDate,
    });

    const populatedTask = await (createdTask as any)
        .populate(userPopulateOptions)
        .populate(assignedToPopulateOptions) as ITask;

    res.status(201).json(populatedTask);
  } catch (error: any) {
    console.error("Error al crear la tarea:", error);
    res.status(500).json({ message: 'Error del servidor al crear la tarea.', error: error.message });
  }
};

/**
 * @desc    Actualizar una tarea existente
 * @route   PUT /api/tareas/:id
 * @access  Private (roles permitidos en la ruta)
 */
export const updateTask = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title, description, activities, completed, assignedTo, dueDate } = req.body;
  const userId = req.user?._id;
  const userRole = req.user?.role;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: 'ID de tarea no válido.' });
    return;
  }

  try {
    const task = await Task.findById(id);

    if (!task) {
      res.status(404).json({ message: 'Tarea no encontrada.' });
      return;
    }

    // Lógica de autorización a nivel de documento para actualizar
    if (userRole !== 'admin' && userRole !== 'project_manager') {
        if (task.user.toString() !== userId?.toString() &&
            !(task.assignedTo && task.assignedTo.some(assignedId => assignedId.toString() === userId?.toString()))) {
            res.status(403).json({ message: 'No tienes permiso para actualizar esta tarea.' });
            return;
        }
        // Si no es admin/PM, no puede cambiar el campo 'assignedTo'
        if (assignedTo !== undefined && JSON.stringify(assignedTo) !== JSON.stringify(task.assignedTo?.map(id => id.toString()))) {
             res.status(403).json({ message: 'No tienes permiso para cambiar la asignación de tareas.' });
             return;
        }
    }

    const updateFields: Partial<ITask> = {};
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (activities !== undefined) updateFields.activities = activities;
    if (completed !== undefined) updateFields.completed = completed;
    if (dueDate !== undefined) updateFields.dueDate = dueDate;

    // Solo actualizar 'assignedTo' si el rol tiene permiso o si el campo no viene en la petición
    if (userRole === 'admin' || userRole === 'project_manager') {
        if (assignedTo !== undefined) updateFields.assignedTo = assignedTo;
    } else if (assignedTo !== undefined && JSON.stringify(assignedTo.sort()) !== JSON.stringify(task.assignedTo?.map(id => id.toString()).sort())) {
        res.status(403).json({ message: 'No tienes permiso para cambiar la asignación de tareas.' });
        return;
    }


    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    )
      .populate(userPopulateOptions)
      .populate(assignedToPopulateOptions) as ITask;

    if (!updatedTask) {
      res.status(404).json({ message: 'Tarea no encontrada.' });
      return;
    }

    res.status(200).json(updatedTask);

  } catch (error: any) {
    console.error("Error al actualizar la tarea:", error);
    if (error.name === 'CastError') {
      res.status(400).json({ message: 'Datos de actualización no válidos.' });
      return;
    }
    res.status(500).json({ message: 'Error del servidor al actualizar la tarea.', error: error.message });
  }
};

/**
 * @desc    Eliminar una tarea
 * @route   DELETE /api/tareas/:id
 * @access  Private (roles permitidos en la ruta)
 */
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?._id;
  const userRole = req.user?.role;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: 'ID de tarea no válido.' });
    return;
  }

  try {
    const task = await Task.findById(id);

    if (!task) {
      res.status(404).json({ message: 'Tarea no encontrada.' });
      return;
    }

    // Lógica de autorización a nivel de documento para eliminar
    if (userRole !== 'admin' && userRole !== 'project_manager' && task.user.toString() !== userId?.toString()) {
        res.status(403).json({ message: 'No tienes permiso para eliminar esta tarea.' });
        return;
    }

    await Task.deleteOne({ _id: id });
    res.status(200).json({ message: 'Tarea eliminada exitosamente.' });

  } catch (error: any) {
    console.error("Error al eliminar la tarea:", error);
    res.status(500).json({ message: 'Error del servidor al eliminar la tarea.', error: error.message });
  }
};