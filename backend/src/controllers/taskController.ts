//Archivo que contiene las funciones para manejar todas las operaciones de las tareas: crear, leer, actualizar y eliminar.

import { Request, Response } from 'express'; // Importamos los tipos de Request y Response de Express para usar TypeScript
import  Tarea, { Task } from '../models/Tarea'; 
// Importamos el Modelo 'Tarea' y la Interfaz 'ITask' que se definio en el archivo 'Tarea.ts'

// --- 1. Función para CREAR una nueva tarea
export const crearTarea = async (req: Request, res: Response): Promise<void> => {
	try {
    	const { titulo, descripcion } = req.body;
 
    	// --- Validación básica de los datos ---
    	if (!titulo) {
        	res.status(400).json({ message: 'El título es obligatorio para la tarea.' });
        	return;
    	}
    	// Se crea nueva instancia de Tarea usando el Modelo 'Tarea'.
    	const nuevaTarea: Task = new Tarea({
        	titulo,   
        	descripcion 
    	});
    	
      // Guardamos la nueva tarea en la base de datos de MongoDB.
    	const guardarTarea= await nuevaTarea.save();
 
    	// Si la tarea se guardó exitosamente, enviamos una respuesta al cliente.
    	res.status(201).json(guardarTarea);
	} catch (error: any) {
    	// --- Manejo de errores ---
    	console.error('Error al crear la tarea:', error.message);
    	res.status(500).json({ message: 'Error interno del servidor al crear la tarea.' });
	}
};

// --- 2. Función para OBTENER TODAS las tareas (GET /api/tareas)
// Esta función busca todas las tareas en la base de datos y las envía al cliente.
export const getTareas = async (req: Request, res: Response): Promise<void> => {
	try {
    	// Task.find(): método de Mongoose que busca todos los documentos
    	const tareas: Task[] = await Tarea.find();
 
    	// Si la búsqueda es exitosa, enviamos las tareas al cliente.
    	res.status(200).json(tareas);
	} catch (error: any) {
    	console.error('Error al obtener las tareas:', error.message);
    	res.status(500).json({ message: 'Error interno del servidor al obtener las tareas.' });
	}
};

// --- 3. Función para OBTENER UNA tarea por su ID (GET /api/tareas/:id)
// Esta función busca una tarea específica utilizando su id
export const getTareasId = async (req: Request, res: Response): Promise<void> => {
	try {
    	// req.params.id: Extrae el ID de la tarea directamente de la URL.
    	const { id } = req.params;

    	const tareaid: Task | null = await Tarea.findById(id); 
    	if (!tareaid) {
        	// res.status(404) código HTTP 404 (Not Found - No Encontrado).
        	res.status(404).json({ message: 'Tarea no encontrada.' });
        	return;
    	}
 
    	// Si la tarea se encuentra, enviamos al cliente con código 200 (OK).
    	res.status(200).json(tareaid);
	} catch (error: any) {
    	// Manejo de errores específicos para IDs no válidos:
    	if (error.name === 'CastError') {
        	res.status(400).json({ message: 'ID de tarea no válido.' });
        	return;
    	}
    	console.error('Error al obtener la tarea por ID:', error.message);
    	res.status(500).json({ message: 'Error interno del servidor al obtener la tarea.' });
	}
};

// --- 4. Función para ACTUALIZAR una tarea (PUT /api/tasks/:id) ---
// Esta función actualiza los datos de una tarea existente basándose en su ID.
export const updateTarea = async (req: Request, res: Response): Promise<void> => {
	try {
    	const { id } = req.params; // ID de la tarea a actualizar de la URL
    	// Extraemos los campos que podrían ser actualizados del cuerpo de la petición.
    	const { titulo, descripcion, check } = req.body;
 
    	// --- Validación básica antes de actualizar ---
    	// Si el cliente no envía ningún campo, no hay nada que actualizar.
    	if (!titulo && descripcion === undefined && check === undefined) {
        	res.status(400).json({ message: 'Se requiere al menos un campo (title, description, o completed) para actualizar.' });
        	return;
    	}

    	const tareaAct: Task | null = await Tarea.findByIdAndUpdate(
        	id,
        	{ titulo, descripcion, check },
        	{ new: true, runValidators: true }
    	);
 
    	// Si no se encuentra la tarea con el ID proporcionado.
    	if (!tareaAct) {
        	res.status(404).json({ message: 'Tarea no encontrada para actualizar.' });
        	return;
    	}
    	// Si la tarea se actualiza exitosamente, la enviamos de vuelta al cliente con código 200 (OK).
    	res.status(200).json(tareaAct);
	} catch (error: any) {
    	// Manejo de errores
    	if (error.name === 'CastError') {
        	res.status(400).json({ message: 'ID de tarea no válido.' });
        	return;
    	}
    	// Si la actualización viola alguna validación del Schema (ej. título muy corto),
    	// Mongoose lanza un 'ValidationError'.
    	if (error.name === 'ValidationError') {
        	res.status(400).json({ message: error.message }); 
        	return;
    	}
    	console.error('Error al actualizar la tarea:', error.message);
    	res.status(500).json({ message: 'Error interno del servidor al actualizar la tarea.' });
	}
};
 
// --- 5. Función para ELIMINAR una tarea (DELETE /api/tasks/:id) ---
// Esta función elimina una tarea específica de la base de datos por su ID.
export const deleteTarea = async (req: Request, res: Response): Promise<void> => {
	try {
    	const { id } = req.params; // ID de la tarea a eliminar de la URL
 
    	const deletedTarea: Task | null = await Tarea.findByIdAndDelete(id);
 
    	if (!deletedTarea) {
        	res.status(404).json({ message: 'Tarea no encontrada para eliminar.' });
        	return;
    	}
 
    	// Si la tarea se elimina exitosamente, enviamos un mensaje de confirmación con código 200 (OK).
    	res.status(200).json({ message: 'Tarea eliminada exitosamente.' });
	} catch (error: any) {
    	// Manejo de errores para IDs no válidos.
    	if (error.name === 'CastError') {
        	res.status(400).json({ message: 'ID de tarea no válido.' });
        	return;
    	}
    	console.error('Error al eliminar la tarea:', error.message);
    	res.status(500).json({ message: 'Error interno del servidor al eliminar la tarea.' });
	}
};