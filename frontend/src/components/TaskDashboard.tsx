import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, List, ListItem, ListItemText,
  CircularProgress, Alert, Box, Paper, Checkbox, IconButton, Collapse
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

// Interfaz para el objeto de usuario que viene del backend
interface PopulatedUser {
  _id: string;
  email: string;
  name: string;
  role: { name: string; _id: string };
}

// Interfaz para el objeto de actividad
interface Activity {
  _id: string;
  name: string;
  completed: boolean;
}

// Interfaz UNIFICADA para la tarea
export interface Task {
  _id: string;
  title: string;
  description?: string;
  activities: Activity[];
  completed: boolean;
  dueDate?: string;
  user: PopulatedUser;
  assignedTo?: PopulatedUser[];
}

const TaskDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allUsers, setAllUsers] = useState<PopulatedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

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
      const response = await axios.get('/api/tasks', config);
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

  const fetchUsers = async () => {
    if (!token) return;
    try {
      const response = await axios.get('/api/users', config);
      setAllUsers(response.data);
    } catch (err) {
      console.error('Error al obtener la lista de usuarios:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTasks();
      fetchUsers();
    } else {
      setLoading(false);
      setError('Debes iniciar sesión para ver las tareas.');
    }
  }, [token]);

  const handleEditClick = (taskId: string) => {
    navigate(`/tasks/edit/${taskId}`);
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

  const getUserName = (userId: string): string => {
    const foundUser = allUsers.find(u => u._id === userId);
    return foundUser ? `${foundUser.name} (${foundUser.role.name})` : 'Usuario Desconocido';
  };

  const isTaskExpanded = (taskId: string) => expandedTask === taskId;
  const toggleExpanded = (taskId: string) => {
    setExpandedTask(isTaskExpanded(taskId) ? null : taskId);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        Dashboard de Tareas
      </Typography>

      {loading && <CircularProgress sx={{ display: 'block', margin: 'auto' }} />}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && tasks.length > 0 && (
        <>
            <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Lista de Tareas
                </Typography>
                <List>
                    {tasks.map(task => (
                    <Paper elevation={1} sx={{ mb: 1, textDecoration: task.completed ? 'line-through' : 'none' }} key={task._id}>
                        <ListItem>
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
                                {task.user && <div>Creada por: {task.user.name}</div>}
                                {task.assignedTo && task.assignedTo.length > 0 && (
                                    <div>Asignado a: {task.assignedTo.map(u => u.name).join(', ')}</div>
                                )}
                                <div>Estado: {task.completed ? 'Completada' : 'Pendiente'}</div>
                                </>
                            }
                            sx={{ flexGrow: 1 }}
                            />
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <IconButton onClick={() => toggleExpanded(task._id)}>
                                    {isTaskExpanded(task._id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </IconButton>
                                <IconButton edge="end" aria-label="edit" onClick={() => handleEditClick(task._id)}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteTask(task._id)}>
                                    <DeleteIcon />
                                </IconButton>
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
        </>
      )}
      {!loading && !error && tasks.length === 0 && (
        <Alert severity="info">No tienes tareas pendientes.</Alert>
      )}
    </Container>
  );
};

export default TaskDashboard;