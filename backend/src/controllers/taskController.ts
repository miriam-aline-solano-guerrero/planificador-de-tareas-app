import { Request, Response } from 'express';
import Task, { ITask } from '../models/Task';
import mongoose from 'mongoose';

/**
 * @desc    Obtener todas las tareas (ahora público)
 * @route   GET /api/tareas
 * @access  Public
 */
export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const tasks = await Task.find({}).lean() as ITask[];
    res.status(200).json(tasks);
  } catch (error: any) {
    console.error("Error al obtener las tareas:", error);
    res.status(500).json({ message: 'Error del servidor al obtener tareas.', error: error.message });
  }
};

/**
 * @desc    Crear una nueva tarea (ahora público)
 * @route   POST /api/tareas
 * @access  Public
 */
export const createTask = async (req: Request, res: Response): Promise<void> => {
  const { title, description, activities, assignedTo, dueDate } = req.body;

  if (!title || !description) {
    res.status(400).json({ message: 'El título y la descripción son obligatorios.' });
    return;
  }

  try {
    const createdTask: ITask = await Task.create({
      title,
      description,
      activities,
      assignedTo,
      dueDate,
    });

    res.status(201).json(createdTask);
  } catch (error: any) {
    console.error("Error al crear la tarea:", error);
    res.status(500).json({ message: 'Error del servidor al crear la tarea.', error: error.message });
  }
};

/**
 * @desc    Actualizar una tarea existente (ahora público)
 * @route   PUT /api/tareas/:id
 * @access  Public
 */
export const updateTask = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title, description, activities, completed, assignedTo, dueDate } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: 'ID de tarea no válido.' });
    return;
  }

  try {
    const updateFields: Partial<ITask> = {};
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (activities !== undefined) updateFields.activities = activities;
    if (completed !== undefined) updateFields.completed = completed;
    if (dueDate !== undefined) updateFields.dueDate = dueDate;
    if (assignedTo !== undefined) updateFields.assignedTo = assignedTo;

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ) as ITask;

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
 * @desc    Eliminar una tarea (ahora público)
 * @route   DELETE /api/tareas/:id
 * @access  Public
 */
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

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

    await Task.deleteOne({ _id: id });
    res.status(200).json({ message: 'Tarea eliminada exitosamente.' });
  } catch (error: any) {
    console.error("Error al eliminar la tarea:", error);
    res.status(500).json({ message: 'Error del servidor al eliminar la tarea.', error: error.message });
  }
};