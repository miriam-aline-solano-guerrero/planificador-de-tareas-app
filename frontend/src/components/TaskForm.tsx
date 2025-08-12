// frontend/src/components/TaskForm.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Container, Typography, TextField, Button, Box, Paper, Alert,
  FormControl, InputLabel, Select, MenuItem, Checkbox, Chip, OutlinedInput, CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

// Interfaces necesarias
interface PopulatedUser {
  _id: string;
  email: string;
  name: string;
  role: { name: string; _id: string };
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
  activities: Activity[]; // Asegúrate de que esto no sea opcional si siempre viene del backend
  completed: boolean;
  dueDate?: string;
  user: PopulatedUser;
  assignedTo?: PopulatedUser[];
}

const TaskForm = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newActivityInput, setNewActivityInput] = useState('');
  const [newActivities, setNewActivities] = useState<string[]>([]);
  const [newDueDate, setNewDueDate] = useState('');
  const [allUsers, setAllUsers] = useState<PopulatedUser[]>([]);
  const [selectedAssignedTo, setSelectedAssignedTo] = useState<string[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingTask, setLoadingTask] = useState(false); // Estado de carga para la tarea a editar

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  useEffect(() => {
    // Fetch all users for the collaborator dropdown
    const fetchUsers = async () => {
      if (!token) return;
      try {
        const response = await axios.get('/api/users', config);
        setAllUsers(response.data);
      } catch (err) {
        console.error('Error al obtener la lista de usuarios para el formulario:', err);
      }
    };
    fetchUsers();

    // Fetch the specific task if taskId is present (editing mode)
    if (taskId && token) {
      setLoadingTask(true); // Start loading state
      const fetchTask = async () => {
        try {
          const response = await axios.get(`/api/tasks/${taskId}`, config);
          const task: Task = response.data; // Explicitly cast the response data to Task interface
          setEditingTask(task);
          setNewTaskTitle(task.title);
          setNewTaskDescription(task.description || '');
          // Safely map activity names, defaulting to empty array if activities is null/undefined
          setNewActivities(task.activities?.map((a) => a.name) || []);
          setNewDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
          // Safely map assignedTo IDs, defaulting to empty array if assignedTo is null/undefined
          setSelectedAssignedTo(task.assignedTo?.map((u) => u._id) || []);
          setError(null); // Clear any previous errors if fetch is successful
        } catch (err: any) {
          setError('No se pudo cargar la tarea para edición. Verifique el ID o su conexión.');
          console.error('Error al cargar la tarea para edición:', err);
          // If the task cannot be loaded, it's safer to redirect away from a broken form
          navigate('/tasks'); 
        } finally {
          setLoadingTask(false); // End loading state
        }
      };
      fetchTask();
    } else if (!taskId) { // If there's no taskId, it's a new task, so reset form states
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewActivities([]);
      setNewDueDate('');
      setSelectedAssignedTo([]);
      setEditingTask(null);
      setError(null);
      setLoadingTask(false); // No task to load, so no active loading
    }
  }, [taskId, token, navigate]); // Add navigate to the dependency array

  const handleCreateOrUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle || !token) {
      setError('El título es obligatorio y debe estar autenticado.');
      return;
    }

    const taskData = {
      title: newTaskTitle,
      description: newTaskDescription,
      activities: newActivities, // This is already a string[]
      dueDate: newDueDate || undefined,
      assignedTo: selectedAssignedTo, // This is already a string[]
    };

    try {
      if (editingTask) {
        await axios.put(`/api/tasks/${editingTask._id}`, taskData, config);
        setError('Tarea actualizada exitosamente.');
      } else {
        await axios.post('/api/tasks', taskData, config);
        setError('Tarea creada exitosamente.');
      }
      setTimeout(() => {
        navigate('/tasks');
      }, 1000); // Redirect after 1 second for success message to be seen
    } catch (err: any) {
      console.error('Error al guardar la tarea:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'No se pudo guardar la tarea.');
    }
  };

  const handleAddActivity = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && newActivityInput.trim() !== '') {
      e.preventDefault();
      setNewActivities(prevActivities => [...prevActivities, newActivityInput.trim()]);
      setNewActivityInput('');
    }
  };

  const handleDeleteActivity = (activityToDelete: string) => {
    setNewActivities(prevActivities => prevActivities.filter(activity => activity !== activityToDelete));
  };

  const handleCollaboratorChange = (event: any) => {
    const {
      target: { value },
    } = event;
    setSelectedAssignedTo(
      // On autofill we get a stringified value. Ensure proper type handling.
      typeof value === 'string' ? value.split(',') : value,
    );
  };
  
  if (loadingTask) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Cargando tarea...</Typography>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom align="center">
          {editingTask ? 'Editar Tarea' : 'Crear Nueva Tarea'}
        </Typography>
        {error && <Alert severity={error.includes("exitosamente") ? "success" : "error"} sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleCreateOrUpdateTask} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            color= "secondary"
            label="Título de la tarea"
            variant="outlined"
            required
            fullWidth
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
          <TextField
            color='secondary'
            label="Descripción"
            variant="outlined"
            required
            multiline
            rows={1}
            fullWidth
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
          />
          <Box>
            <Typography variant="subtitle1" gutterBottom>Actividades</Typography>
            <TextField
              color="secondary"
              label="Escribe una actividad y presiona Enter"
              variant="outlined"
              fullWidth
              value={newActivityInput}
              onChange={(e) => setNewActivityInput(e.target.value)}
              onKeyDown={handleAddActivity}
            />
            <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {newActivities.map((activity, index) => (
                <Chip
                  key={index} // Using index as key is okay for static lists, but better to use a unique ID if activities had one.
                  label={activity}
                  onDelete={() => handleDeleteActivity(activity)}
                  deleteIcon={<DeleteIcon />}
                  color="secondary"
                />
              ))}
            </Box>
          </Box>
          
          <FormControl fullWidth>
            <InputLabel color= "secondary" id="collaborator-select-label">Asignar a:</InputLabel>
            <Select
            color='secondary'
              labelId="collaborator-select-label"
              id="collaborator-select"
              multiple
              value={selectedAssignedTo}
              onChange={handleCollaboratorChange}
              input={<OutlinedInput id="select-collaborator-chip" label="Colaboradores" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
                  {selected.map((value) => {
                    const user = allUsers.find(u => u._id === value);
                    return <Chip key={value} label={user ? `${user.name} (${user.email})` : 'Desconocido'} />;
                  })}
                </Box>
              )}
            >
              {allUsers.map((user) => (
                <MenuItem
                  key={user._id}
                  value={user._id}
                >
                  <Checkbox color= "secondary" checked={selectedAssignedTo.indexOf(user._id) > -1} />
                  <Box>
                    <Typography variant="body1">{user.name} ({user.role.name})</Typography>
                    <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            color='secondary'
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
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button type="submit" variant="outlined" color="success">
              {editingTask ? 'Guardar Cambios' : 'Crear Tarea'}
            </Button>
            <Button variant="outlined" color="error" onClick={() => navigate('/tasks')}>
              Cancelar
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default TaskForm;