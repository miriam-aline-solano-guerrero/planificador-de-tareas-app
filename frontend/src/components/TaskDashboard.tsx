import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Container, Typography, List, ListItem, ListItemText,
    CircularProgress, Alert, Box, Paper, Checkbox, IconButton,
    Collapse, Button
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TaskEditFormModal from './TaskEdit';

// --- Interfaces para la lista de tareas ---
interface User {
    _id: string;
    name: string;
    email: string;
}

interface Activity {
    _id: string;
    name: string;
    completed: boolean;
}

export interface Task {
    _id: string;
    title: string;
    description?: string;
    activities: Activity[];
    completed: boolean;
    dueDate?: string;
    user: User;
    assignedTo?: User[];
}

const TaskDashboard = () => {
    const { token, user, isAdmin } = useAuth(); // <--- IMPORTANTE: Obtener `user` e `isAdmin` del contexto
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedTask, setExpandedTask] = useState<string | null>(null);
    const navigate = useNavigate();

    // Estado para el modal de edición
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const fetchTasks = async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            // --- CAMBIO AQUÍ: Endpoint condicional basado en el rol de admin ---
            const endpoint = isAdmin ? '/api/tasks/all' : '/api/tasks';
            const response = await axios.get<Task[]>(endpoint, config);
            setTasks(response.data);
            setError(null);
        } catch (err: any) {
            if (err.response?.status === 401) {
                setError('No estás autenticado. Por favor, inicia sesión.');
            } else {
                setError('No se pudieron obtener las tareas.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchTasks();
        } else {
            setLoading(false);
            setError('Debes iniciar sesión para ver las tareas.');
        }
    }, [token, isAdmin]); // <--- IMPORTANTE: Volver a cargar las tareas si cambia el rol

    const handleOpenEditModal = (task: Task) => {
        setSelectedTask(task);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedTask(null);
        fetchTasks();
    };

    const handleToggleCompleted = async (id: string, completed: boolean) => {
        try {
            await axios.put(`/api/tasks/${id}`, { completed: !completed }, config);
            setTasks(tasks.map(task =>
                task._id === id ? { ...task, completed: !completed } : task
            ));
        } catch (err: any) {
            console.error('Error al actualizar la tarea:', err.response?.data || err.message);
            setError('No se pudo actualizar el estado de la tarea.');
        }
    };

    const handleDeleteTask = async (id: string) => {
        try {
            await axios.delete(`/api/tasks/${id}`, config);
            setTasks(tasks.filter(task => task._id !== id));
        } catch (err: any) {
            console.error('Error al eliminar la tarea:', err.response?.data || err.message);
            setError('No se pudo eliminar la tarea.');
        }
    };

    const handleToggleActivityCompleted = async (taskId: string, activityId: string, completed: boolean) => {
        try {
            const response = await axios.put(`/api/tasks/${taskId}/activities/${activityId}`, { completed: !completed }, config);
            setTasks(tasks.map(task =>
                task._id === taskId ? response.data : task
            ));
        } catch (err: any) {
            console.error('Error al actualizar el estado de la actividad:', err.response?.data || err.message);
            setError('No se pudo actualizar el estado de la actividad.');
        }
    };

    const isTaskExpanded = (taskId: string) => expandedTask === taskId;
    const toggleExpanded = (taskId: string) => {
        setExpandedTask(isTaskExpanded(taskId) ? null : taskId);
    };
    
    // --- NUEVA LÓGICA: Lógica de permisos para los botones ---
    const canModifyTask = (task: Task) => {
        // Un admin puede editar cualquier tarea
        if (isAdmin) return true;
        // Un usuario normal solo puede editar las suyas
        return user?._id === task.user._id;
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h4" component="h2" gutterBottom>
                {isAdmin ? "Todas las Tareas del Sistema" : "Mis Tareas"}
            </Typography>
            <Button variant="contained" color="primary" onClick={() => navigate('/tasks/create')}>
                Crear Nueva Tarea
            </Button>

            {loading && <CircularProgress sx={{ display: 'block', margin: 'auto' }} />}
            {error && <Alert severity="error">{error}</Alert>}

            {!loading && !error && tasks.length > 0 && (
                <Paper elevation={2} sx={{ p: 2, mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Lista de Tareas
                    </Typography>
                    <List>
                        {tasks.map(task => (
                            <Paper elevation={1} sx={{ mb: 1 }} key={task._id}>
                                <ListItem sx={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        <Checkbox
                                            checked={task.completed}
                                            onChange={() => handleToggleCompleted(task._id, task.completed)}
                                            color="primary"
                                        />
                                        <ListItemText
                                            primary={task.title}
                                            secondary={
                                                <>
                                                    {task.description && <div>{task.description}</div>}
                                                    {task.dueDate && <div>Fecha de entrega: {new Date(task.dueDate).toLocaleDateString()}</div>}
                                                    {/* --- MUESTRA AL CREADOR SOLO SI ES ADMIN --- */}
                                                    {isAdmin && task.user && <div>Creada por: {task.user.email}</div>}
                                                    {task.assignedTo && task.assignedTo.length > 0 && (
                                                        <div>Asignado a: {task.assignedTo.map(u => u.email).join(', ')}</div>
                                                    )}
                                                </>
                                            }
                                            sx={{ flexGrow: 1 }}
                                        />
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <IconButton onClick={() => toggleExpanded(task._id)}>
                                                {isTaskExpanded(task._id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                            </IconButton>
                                            {/* --- MUESTRA LOS BOTONES DE EDITAR Y ELIMINAR SOLO SI EL USUARIO PUEDE MODIFICAR LA TAREA --- */}
                                            {canModifyTask(task) && (
                                                <>
                                                    <IconButton edge="end" aria-label="edit" onClick={() => handleOpenEditModal(task)}>
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteTask(task._id)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </>
                                            )}
                                        </Box>
                                    </Box>
                                </ListItem>
                                <Collapse in={isTaskExpanded(task._id)} timeout="auto" unmountOnExit>
                                    <Box sx={{ pl: 4, pt: 1, pb: 1 }}>
                                        <Typography variant="subtitle2" gutterBottom>Actividades:</Typography>
                                        <List dense>
                                            {task.activities.length > 0 ? (
                                                task.activities.map(activity => (
                                                    <ListItem key={activity._id} disablePadding>
                                                        <Checkbox
                                                            checked={activity.completed}
                                                            onChange={() => handleToggleActivityCompleted(task._id, activity._id, activity.completed)}
                                                        />
                                                        <ListItemText
                                                            primary={activity.name}
                                                            sx={{ textDecoration: activity.completed ? 'line-through' : 'none' }}
                                                        />
                                                    </ListItem>
                                                ))
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    No hay actividades para esta tarea.
                                                </Typography>
                                            )}
                                        </List>
                                    </Box>
                                </Collapse>
                            </Paper>
                        ))}
                    </List>
                </Paper>
            )}
            {!loading && !error && tasks.length === 0 && (
                <Alert severity="info" sx={{ mt: 3 }}>No tienes tareas pendientes.</Alert>
            )}
            {selectedTask && (
                <TaskEditFormModal
                    open={isEditModalOpen}
                    handleClose={handleCloseEditModal}
                    task={selectedTask}
                />
            )}
        </Container>
    );
};

export default TaskDashboard;