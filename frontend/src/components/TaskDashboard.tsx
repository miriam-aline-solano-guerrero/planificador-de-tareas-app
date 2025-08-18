import React, { useState, useEffect } from 'react';
import axios, { isAxiosError } from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Container, Typography, List, ListItem, ListItemText,
    CircularProgress, Alert, Box, Paper, Checkbox, IconButton,
    Collapse,
    Chip,
    Button
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TaskEditFormModal from './TaskEdit';

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

interface Dependency {
    _id: string,
    title: string,
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
    dependencies?: Dependency[];
}

const TaskDashboard = () => {
    const { token, user, isAdmin } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedTask, setExpandedTask] = useState<string | null>(null);
    const navigate = useNavigate();

    // Estado para edición de tareas
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    //obtener las tareas
    const fetchTasks = async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const endpoint = isAdmin ? '/api/tasks' : '/api/tasks/';
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
    }, [token, isAdmin]); // Volver a cargar las tareas si cambia el rol

    const handleOpenEditModal = (task: Task) => {
        setSelectedTask(task);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedTask(null);
        fetchTasks();
    };

    const handleToggleCompleted = async (task: Task) => {
        try {
            // El backend valida las dependencias al intentar completar la tarea
            await axios.put(`/api/tasks/${task._id}`, { completed: true }, config);
            // Actualiza el estado si la operación es exitosa
            setTasks(prevTasks => 
                prevTasks.map(t => 
                    t._id === task._id ? { ...t, completed: true } : t
                )
            );
        } catch {
            console.log(error);
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
    
    //permisos para los botones
    const canModifyTask = (task: Task) => {
        // Un rol admin puede editar cualquier tarea
        if (isAdmin) return true;
        // Un rol usuario solo puede editar las suyas
        return user?._id === task.user._id;
    };

    // Comprobar si la tarea está bloqueada por dependencias 
    const isTaskBlocked = (task: Task): boolean => {
        return !!task.dependencies?.some(dep => !dep.completed);
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h4" component="h2" gutterBottom>
                {isAdmin ? "Panel de tareas" : "Mis tareas"}
            </Typography>
            <Button variant="outlined" color="secondary" onClick={() => navigate('/tasks/create')}>
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
                        {tasks.map(task => {
                            const blocked = isTaskBlocked(task);
                            const checkboxColor = blocked ? 'error' : 'secondary';

                           return (
                                <Paper elevation={1} sx={{ mb: 1 }} key={task._id}>
                                    <ListItem sx={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                            {/*DEPENDENCIAS: Checkbox*/}
                                            <Checkbox
                                                edge="end"
                                                onChange={() => handleToggleCompleted(task)}
                                                checked={task.completed}
                                                disabled={task.completed || blocked} // Deshabilitado si ya está completa O si está bloqueada
                                                color={checkboxColor}
                                            />
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        {task.title}
                                                        {/* Icono de bloqueo cuando la tarea está bloqueada */}
                                                        {blocked && !task.completed && (
                                                            <Box sx={{ ml: 1, display: 'flex', alignItems: 'center' }}>
                                                                <span role="img" aria-label="blocked" style={{ fontSize: '1.2rem', color: 'red' }}>🔒</span>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                }
                                                secondary={
                                                    <>
                                                        {task.description && <div>Descripción: {task.description}</div>}
                                                        {task.dueDate && <div>Fecha de entrega: {new Date(task.dueDate).toLocaleDateString()}</div>}
                                                        {isAdmin && task.user && <div>Creada por: {task.user.name} | {task.user.email}</div>}
                                                        {task.assignedTo && task.assignedTo.length > 0 && (
                                                            <div>Asignado a: {task.assignedTo.map(u => u.name).join(', ')}</div>
                                                        )}
                                                        {task.completed && <div>Estado de la tarea: {task.completed}</div>}
                                                        {task.dependencies && task.dependencies.length > 0 && (
                                                            <div>
                                                                Depende de:
                                                                {task.dependencies.map(dep => (
                                                                    <Chip
                                                                        key={dep._id}
                                                                        label={dep.title}
                                                                        size="small"
                                                                        color={dep.completed ? "success" : "error"}
                                                                        sx={{ ml: 0.5, mr: 0.5 }}
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}
                                                    </>
                                                }
                                                sx={{ flexGrow: 1 }}
                                            />
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <IconButton onClick={() => toggleExpanded(task._id)}>
                                                    {isTaskExpanded(task._id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                                </IconButton>
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
                            );
                        })}
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