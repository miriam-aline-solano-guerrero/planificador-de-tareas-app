import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Container, Typography, List, ListItem, ListItemText,
  CircularProgress, Alert, Box, TextField, Button,
  Paper, Checkbox, IconButton, Collapse,
  Select, MenuItem, FormControl, InputLabel, Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// --- Interfaces ---
interface User {
  _id: string;
  name: string;
  role: {
    _id: string;
    name: string;
  };
}

interface Activity {
  _id: string;
  name: string;
  completed: boolean;
}

interface Task {
  _id: string;
  title: string;
  description?: string;
  activities: Activity[];
  completed: boolean;
  dueDate?: string;
  user: {
    _id: string;
    name: string;
  };
  assignedTo?: User[];
}

// --- Componente del Formulario de Edición ---
interface TaskCreationFormProps {
  newTaskTitle: string;
  setNewTaskTitle: (value: string) => void;
  newTaskDescription: string;
  setNewTaskDescription: (value: string) => void;
  newActivityInput: string;
  setNewActivityInput: (value: string) => void;
  newActivities: string[];
  setNewActivities: (value: string[]) => void;
  newDueDate: string;
  setNewDueDate: (value: string) => void;
  newAssignedTo: string[];
  setNewAssignedTo: (value: string[]) => void;
  allUsers: User[];
  editingTask: Task | null;
  handleAddActivity: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  handleDeleteActivity: (activityToDelete: string) => void;
  handleCreateOrUpdateTask: (e: React.FormEvent) => void;
  resetForm: () => void;
}

const TaskCreationForm = ({
  newTaskTitle, setNewTaskTitle, newTaskDescription, setNewTaskDescription,
  newActivityInput, setNewActivityInput, newActivities, setNewActivities,
  newDueDate, setNewDueDate, newAssignedTo, setNewAssignedTo, allUsers,
  editingTask, handleAddActivity, handleDeleteActivity,
  handleCreateOrUpdateTask, resetForm
}: TaskCreationFormProps) => {
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" component="h3" gutterBottom>
        {editingTask ? 'Editar Tarea' : 'Crear Nueva Tarea'}
      </Typography>
      <Box component="form" onSubmit={handleCreateOrUpdateTask} noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          label="Título de la Tarea"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
        />
        <TextField
          margin="normal"
          fullWidth
          label="Descripción (opcional)"
          multiline
          rows={3}
          value={newTaskDescription}
          onChange={(e) => setNewTaskDescription(e.target.value)}
        />
        <TextField
          margin="normal"
          fullWidth
          type="date"
          label="Fecha de Entrega"
          InputLabelProps={{ shrink: true }}
          value={newDueDate}
          onChange={(e) => setNewDueDate(e.target.value)}
        />

        <TextField
          margin="normal"
          fullWidth
          label="Actividades (presiona Enter para agregar)"
          value={newActivityInput}
          onChange={(e) => setNewActivityInput(e.target.value)}
          onKeyDown={handleAddActivity}
        />
        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {newActivities.map((activity, index) => (
            <Chip
              key={index}
              label={activity}
              onDelete={() => handleDeleteActivity(activity)}
            />
          ))}
        </Box>

        <FormControl fullWidth margin="normal">
          <InputLabel>Asignar a</InputLabel>
          <Select
            multiple
            value={newAssignedTo}
            onChange={(e) => setNewAssignedTo(e.target.value as string[])}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(selected as string[]).map((userId) => {
                  const user = allUsers.find(u => u._id === userId);
                  return user ? <Chip key={user._id} label={user.name} /> : null;
                })}
              </Box>
            )}
          >
            {allUsers.map((user) => (
              <MenuItem key={user._id} value={user._id}>
                {`${user.name} (${user.role.name})`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
          >
            {editingTask ? 'Guardar Cambios' : 'Crear Tarea'}
          </Button>
          {editingTask && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={resetForm}
            >
              Cancelar Edición
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

// --- Componente principal del Dashboard ---
const TaskDashboard = () => {
  const { user, token } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newActivityInput, setNewActivityInput] = useState('');
  const [newActivities, setNewActivities] = useState<string[]>([]);
  const [newDueDate, setNewDueDate] = useState('');
  const [newAssignedTo, setNewAssignedTo] = useState<string[]>([]);

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
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

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setNewTaskTitle(task.title);
    setNewTaskDescription(task.description || '');
    setNewActivities(task.activities.map(a => a.name));
    setNewDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    setNewAssignedTo((task.assignedTo || []).map(u => u._id));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewActivityInput('');
    setNewActivities([]);
    setNewDueDate('');
    setNewAssignedTo([]);
    setEditingTask(null);
  };

  const handleAddActivity = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && newActivityInput.trim() !== '') {
      e.preventDefault();
      setNewActivities([...newActivities, newActivityInput.trim()]);
      setNewActivityInput('');
    }
  };

  const handleDeleteActivity = (activityToDelete: string) => {
    setNewActivities(newActivities.filter(activity => activity !== activityToDelete));
  };

  const handleCreateOrUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle || !token) {
      setError('Debes tener un título y estar autenticado para crear una tarea.');
      return;
    }
    const taskData = {
      title: newTaskTitle,
      description: newTaskDescription,
      activities: newActivities,
      dueDate: newDueDate || undefined,
      assignedTo: newAssignedTo,
    };
    try {
      if (editingTask) {
        await axios.put(`/api/tasks/${editingTask._id}`, taskData, config);
      } else {
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
      fetchTasks();
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

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        Dashboard de Tareas
      </Typography>

      {editingTask && user && (
        <TaskCreationForm
          newTaskTitle={newTaskTitle}
          setNewTaskTitle={setNewTaskTitle}
          newTaskDescription={newTaskDescription}
          setNewTaskDescription={setNewTaskDescription}
          newActivityInput={newActivityInput}
          setNewActivityInput={setNewActivityInput}
          newActivities={newActivities}
          setNewActivities={setNewActivities}
          newDueDate={newDueDate}
          setNewDueDate={setNewDueDate}
          newAssignedTo={newAssignedTo}
          setNewAssignedTo={setNewAssignedTo}
          allUsers={allUsers}
          editingTask={editingTask}
          handleAddActivity={handleAddActivity}
          handleDeleteActivity={handleDeleteActivity}
          handleCreateOrUpdateTask={handleCreateOrUpdateTask}
          resetForm={resetForm}
        />
      )}

      {loading && <CircularProgress sx={{ display: 'block', margin: 'auto' }} />}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && tasks.length > 0 && (
        <Paper elevation={2} sx={{ p: 2, mt: 3 }}>
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
                      <IconButton edge="end" aria-label="edit" onClick={() => handleEditClick(task)}>
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
                      {task.activities && task.activities.length > 0 ? (
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
    </Container>
  );
};

export default TaskDashboard;