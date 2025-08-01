"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.createTask = exports.getTasks = void 0;
const Task_1 = __importDefault(require("../models/Task"));
const mongoose_1 = __importDefault(require("mongoose"));
// Opciones de Populate reutilizables para 'user' y 'assignedTo'
const userPopulateOptions = {
    path: 'user',
    select: 'username email',
};
const assignedToPopulateOptions = {
    path: 'assignedTo',
    select: 'username email',
};
/**
 * @desc    Obtener todas las tareas del usuario actual o en las que participa (Admin ve todas)
 * @route   GET /api/tareas
 * @access  Private (requiere autenticación)
 */
const getTasks = async (req, res) => {
    const userId = req.user?._id;
    const userRole = req.user?.role;
    if (!userId) {
        res.status(401).json({ message: 'Usuario no autenticado.' });
        return;
    }
    let query = {};
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
        const tasks = await Task_1.default.find(query)
            .populate(userPopulateOptions)
            .populate(assignedToPopulateOptions)
            .lean();
        res.status(200).json(tasks);
    }
    catch (error) {
        console.error("Error al obtener las tareas:", error);
        res.status(500).json({ message: 'Error del servidor al obtener tareas.', error: error.message });
    }
};
exports.getTasks = getTasks;
/**
 * @desc    Crear una nueva tarea
 * @route   POST /api/tareas
 * @access  Private (roles permitidos en la ruta)
 */
const createTask = async (req, res) => {
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
        const createdTask = await Task_1.default.create({
            title,
            description,
            activities,
            user: userId,
            assignedTo,
            dueDate,
        });
        const populatedTask = await createdTask
            .populate(userPopulateOptions)
            .populate(assignedToPopulateOptions);
        res.status(201).json(populatedTask);
    }
    catch (error) {
        console.error("Error al crear la tarea:", error);
        res.status(500).json({ message: 'Error del servidor al crear la tarea.', error: error.message });
    }
};
exports.createTask = createTask;
/**
 * @desc    Actualizar una tarea existente
 * @route   PUT /api/tareas/:id
 * @access  Private (roles permitidos en la ruta)
 */
const updateTask = async (req, res) => {
    const { id } = req.params;
    const { title, description, activities, completed, assignedTo, dueDate } = req.body;
    const userId = req.user?._id;
    const userRole = req.user?.role;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        res.status(400).json({ message: 'ID de tarea no válido.' });
        return;
    }
    try {
        const task = await Task_1.default.findById(id);
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
        const updateFields = {};
        if (title !== undefined)
            updateFields.title = title;
        if (description !== undefined)
            updateFields.description = description;
        if (activities !== undefined)
            updateFields.activities = activities;
        if (completed !== undefined)
            updateFields.completed = completed;
        if (dueDate !== undefined)
            updateFields.dueDate = dueDate;
        // Solo actualizar 'assignedTo' si el rol tiene permiso o si el campo no viene en la petición
        if (userRole === 'admin' || userRole === 'project_manager') {
            if (assignedTo !== undefined)
                updateFields.assignedTo = assignedTo;
        }
        else if (assignedTo !== undefined && JSON.stringify(assignedTo.sort()) !== JSON.stringify(task.assignedTo?.map(id => id.toString()).sort())) {
            res.status(403).json({ message: 'No tienes permiso para cambiar la asignación de tareas.' });
            return;
        }
        const updatedTask = await Task_1.default.findByIdAndUpdate(id, { $set: updateFields }, { new: true, runValidators: true })
            .populate(userPopulateOptions)
            .populate(assignedToPopulateOptions);
        if (!updatedTask) {
            res.status(404).json({ message: 'Tarea no encontrada.' });
            return;
        }
        res.status(200).json(updatedTask);
    }
    catch (error) {
        console.error("Error al actualizar la tarea:", error);
        if (error.name === 'CastError') {
            res.status(400).json({ message: 'Datos de actualización no válidos.' });
            return;
        }
        res.status(500).json({ message: 'Error del servidor al actualizar la tarea.', error: error.message });
    }
};
exports.updateTask = updateTask;
/**
 * @desc    Eliminar una tarea
 * @route   DELETE /api/tareas/:id
 * @access  Private (roles permitidos en la ruta)
 */
const deleteTask = async (req, res) => {
    const { id } = req.params;
    const userId = req.user?._id;
    const userRole = req.user?.role;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        res.status(400).json({ message: 'ID de tarea no válido.' });
        return;
    }
    try {
        const task = await Task_1.default.findById(id);
        if (!task) {
            res.status(404).json({ message: 'Tarea no encontrada.' });
            return;
        }
        // Lógica de autorización a nivel de documento para eliminar
        if (userRole !== 'admin' && userRole !== 'project_manager' && task.user.toString() !== userId?.toString()) {
            res.status(403).json({ message: 'No tienes permiso para eliminar esta tarea.' });
            return;
        }
        await Task_1.default.deleteOne({ _id: id });
        res.status(200).json({ message: 'Tarea eliminada exitosamente.' });
    }
    catch (error) {
        console.error("Error al eliminar la tarea:", error);
        res.status(500).json({ message: 'Error del servidor al eliminar la tarea.', error: error.message });
    }
};
exports.deleteTask = deleteTask;
