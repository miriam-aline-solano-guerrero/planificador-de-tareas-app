import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Container, Typography, List, ListItem, ListItemText,
  CircularProgress, Alert, Box, TextField, Button,
  Paper
} from '@mui/material';

interface Task {
  _id: string;
  title: string;
  description: string;
  completed: boolean;
}

const TaskDashboard = () => {
  const { user, token } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');

  // Configuración de axios para enviar el token en cada petición
  const api = axios.create({
    baseURL: '/api/tasks',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Función para obtener las tareas
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/');
      setTasks(response.data);
      setError(null);
    } catch (err: any) {
      setError('No se pudieron obtener las tareas. Asegúrate de estar autenticado.');
    } finally {
      setLoading(false);
    }
  };

  // Obtiene las tareas al cargar el componente
  useEffect(() => {
    fetchTasks();
  }, []);

  // Función para crear una nueva tarea
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    try {
      await api.post('/', { title: newTaskTitle, description: newTaskDescription });
      setNewTaskTitle('');
      setNewTaskDescription('');
      fetchTasks(); // Vuelve a cargar las tareas para ver la nueva
    } catch (err: any) {
      setError('No se pudo crear la tarea.');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        Mis Tareas
      </Typography>

      {/* Formulario para crear tareas */}
      <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Crear Nueva Tarea</Typography>
        <Box component="form" onSubmit={handleCreateTask} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Título de la tarea"
            variant="outlined"
            required
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
          <TextField
            label="Descripción (opcional)"
            variant="outlined"
            multiline
            rows={2}
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
          />
          <Button type="submit" variant="contained" color="primary">
            Crear Tarea
          </Button>
        </Box>
      </Paper>

      {/* Muestra el estado de la petición */}
      {loading && <CircularProgress sx={{ display: 'block', margin: 'auto' }} />}
      {error && <Alert severity="error">{error}</Alert>}

      {/* Muestra la lista de tareas */}
      {!loading && !error && tasks.length > 0 && (
        <List>
          {tasks.map(task => (
            <Paper elevation={1} sx={{ mb: 1 }}>
              <ListItem key={task._id}>
                <ListItemText primary={task.title} secondary={task.description} />
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