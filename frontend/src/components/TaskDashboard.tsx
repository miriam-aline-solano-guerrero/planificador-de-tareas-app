import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Container, Typography, List, ListItem, ListItemText,
  CircularProgress, Alert, Box, TextField, Button,
  Paper, Checkbox, IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

interface Task {
  _id: string;
  title: string;
  description?: string;
  activities?: string[];
  completed: boolean;
  dueDate?: string;
  assignedTo?: string[];
}

const TaskDashboard = () => {
  const { user, token } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newActivities, setNewActivities] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newAssignedTo, setNewAssignedTo] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null); // <-- Estado para la tarea que se está editando

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

  useEffect(() => {
    if (token) {
      fetchTasks();
    } else {
      setLoading(false);
      setError('Debes iniciar sesión para ver las tareas.');
    }
  }, [token]);

  // <-- Función para manejar la edición
  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setNewTaskTitle(task.title);
    setNewTaskDescription(task.description || '');
    setNewActivities(task.activities?.join(', ') || '');
    setNewDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    setNewAssignedTo(task.assignedTo?.join(', ') || '');
  };

  // <-- Función para limpiar el formulario después de guardar o cancelar la edición
  const resetForm = () => {
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewActivities('');
    setNewDueDate('');
    setNewAssignedTo('');
    setEditingTask(null);
  };

  // <-- Función para crear/actualizar una tarea
  const handleCreateOrUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle || !token) {
      setError('Debes tener un título y estar autenticado para crear una tarea.');
      return;
    }

    const activitiesArray = newActivities.split(',').map(activity => activity.trim()).filter(Boolean);
    const assignedToArray = newAssignedTo.split(',').map(id => id.trim()).filter(Boolean);

    const taskData = {
      title: newTaskTitle,
      description: newTaskDescription,
      activities: activitiesArray,
      dueDate: newDueDate || undefined,
      assignedTo: assignedToArray,
    };
    
    try {
      if (editingTask) {
        // Lógica para actualizar una tarea existente
        await axios.put(`/api/tasks/${editingTask._id}`, taskData, config);
      } else {
        // Lógica para crear una nueva tarea
        await axios.post('/api/tasks', taskData, config);
      }
      
      resetForm();
      fetchTasks();
    } catch (err: any) {
      console.error('Error al guardar la tarea:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'No se pudo guardar la tarea.');
    }
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

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        Mis Tareas
      </Typography>

      {user && (
        <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            {editingTask ? 'Editar Tarea' : 'Crear Nueva Tarea'}
          </Typography>
          <Box component="form" onSubmit={handleCreateOrUpdateTask} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Título de la tarea"
              variant="outlined"
              required
              fullWidth
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
            />
            <TextField
              label="Descripción (opcional)"
              variant="outlined"
              multiline
              rows={2}
              fullWidth
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
            />
            <TextField
              label="Actividades (separadas por comas)"
              variant="outlined"
              fullWidth
              value={newActivities}
              onChange={(e) => setNewActivities(e.target.value)}
            />
            <TextField
              label="Fecha de entrega"
              type="date"
              variant="outlined"
              fullWidth
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
             <TextField
              label="IDs de Colaboradores (separados por comas)"
              variant="outlined"
              fullWidth
              value={newAssignedTo}
              onChange={(e) => setNewAssignedTo(e.target.value)}
              helperText="Ingresa los IDs de usuario de los colaboradores, separados por comas."
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button type="submit" variant="contained" color="primary">
                {editingTask ? 'Guardar Cambios' : 'Crear Tarea'}
              </Button>
              {editingTask && (
                <Button variant="outlined" color="secondary" onClick={resetForm}>
                  Cancelar
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      )}

      {loading && <CircularProgress sx={{ display: 'block', margin: 'auto' }} />}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && tasks.length > 0 && (
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
                        {task.activities && task.activities.length > 0 && (
                          <div>Actividades: {task.activities.join(', ')}</div>
                        )}
                        {task.dueDate && <div>Fecha de entrega: {new Date(task.dueDate).toLocaleDateString()}</div>}
                        {task.assignedTo && task.assignedTo.length > 0 && (
                          <div>Asignado a: {task.assignedTo.join(', ')}</div>
                        )}
                        <div>Estado: {task.completed ? 'Completada' : 'Pendiente'}</div>
                      </>
                    }
                    sx={{ flexGrow: 1 }}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton edge="end" aria-label="edit" onClick={() => handleEditClick(task)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteTask(task._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </ListItem>
            </Paper>
          ))}
        </List>
      )}
      {!loading && !error && tasks.length === 0 && (
        <Alert severity="info">No tienes tareas pendientes.</Alert>
      )}
    </Container>
  );
};

export default TaskDashboard;