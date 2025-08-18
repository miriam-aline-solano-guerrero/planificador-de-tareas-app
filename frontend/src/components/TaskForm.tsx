import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    Container, Typography, TextField, Button, Box, Paper, Alert,
    FormControl, InputLabel, Select, MenuItem, Checkbox, Chip, OutlinedInput, CircularProgress,
    ListItemText
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

// --- Interfaces para el formulario ---
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
    activities: Activity[];
    completed: boolean;
    dueDate?: string;
    user: PopulatedUser;
    assignedTo?: PopulatedUser[];
    dependencies?: { _id: string; title: string; completed: boolean }[]; // Agregada la dependencia
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
    const [loadingTask, setLoadingTask] = useState(false);

    // --- NUEVOS ESTADOS PARA DEPENDENCIAS ---
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [selectedDependencies, setSelectedDependencies] = useState<string[]>([]);

    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    // --- FUNCIÓN PARA OBTENER TAREAS DISPONIBLES COMO DEPENDENCIAS ---
    const fetchAllTasks = async () => {
    try {
        // Especificamos que la respuesta es un array de tareas (Task[])
        const response = await axios.get<Task[]>('/api/tasks', config);
        // Ahora TypeScript sabe que response.data es un array y tiene el método .filter()
        const filteredTasks = response.data.filter((task) => task._id !== taskId);
        setAllTasks(filteredTasks);
    } catch (err) {
        console.error('Error al obtener la lista de tareas para dependencias:', err);
    }
};

    useEffect(() => {
        const fetchUsers = async () => {
            if (!token) return;
            try {
                const response = await axios.get<PopulatedUser[]>('/api/users', config);
                setAllUsers(response.data);
            } catch (err) {
                console.error('Error al obtener la lista de usuarios para el formulario:', err);
            }
        };
        fetchUsers();
        fetchAllTasks();

        if (taskId && token) {
            setLoadingTask(true);
            const fetchTask = async () => {
                if(!token) return;
                try {
                    // Especificamos que la respuesta es un array de usuarios (PopulatedUser[])
                    const response = await axios.get<Task>(`/api/tasks/${taskId}`, config);
                    const task: Task = response.data;
                    setEditingTask(task);
                    setNewTaskTitle(task.title);
                    setNewTaskDescription(task.description || '');
                    setNewActivities(task.activities.map((a: Activity) => a.name));
                    setNewDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
                    setSelectedAssignedTo(task.assignedTo?.map((u) => u._id) || []);
                    // --- OBTENER DEPENDENCIAS EXISTENTES ---
                    setSelectedDependencies(task.dependencies?.map(d => d._id) || []);
                    setError(null);
                } catch (err: any) {
                    setError('No se pudo cargar la tarea para edición. Verifique el ID o su conexión.');
                    console.error('Error al cargar la tarea para edición:', err);
                    navigate('/tasks');
                } finally {
                    setLoadingTask(false);
                }
            };
            fetchTask();
        } else if (!taskId) {
            setNewTaskTitle('');
            setNewTaskDescription('');
            setNewActivities([]);
            setNewDueDate('');
            setSelectedAssignedTo([]);
            setSelectedDependencies([]); // Limpiar estado de dependencias
            setEditingTask(null);
            setError(null);
            setLoadingTask(false);
        }
    }, [taskId, token, navigate]);

    const handleCreateOrUpdateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle || !token) {
            setError('El título es obligatorio y debe estar autenticado.');
            return;
        }

        const taskData = {
            title: newTaskTitle,
            description: newTaskDescription,
            activities: newActivities,
            dueDate: newDueDate || undefined,
            assignedTo: selectedAssignedTo,
            dependencies: selectedDependencies,
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
                navigate('/tasks'); // Vuelve al dashboard después de 1 segundo
            }, 1000);
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
                    {editingTask ? 'Editar Tarea' : 'Crear Tarea'}
                </Typography>
                {error && <Alert severity={error.includes("exitosamente") ? "success" : "error"} sx={{ mb: 2 }}>{error}</Alert>}
                <Box component="form" onSubmit={handleCreateOrUpdateTask} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        color="secondary"
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
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                            {newActivities.map((activity, index) => (
                                <Chip
                                    key={index}
                                    label={activity}
                                    onDelete={() => handleDeleteActivity(activity)}
                                    deleteIcon={<DeleteIcon />}
                                    color="secondary"
                                />
                            ))}
                        </Box>
                    </Box>

                    <FormControl fullWidth>
                        <InputLabel color="secondary" id="collaborator-select-label">Asignar a:</InputLabel>
                        <Select
                            color='secondary'
                            labelId="collaborator-select-label"
                            id="collaborator-select"
                            multiple
                            value={selectedAssignedTo}
                            onChange={handleCollaboratorChange}
                            input={<OutlinedInput id="select-collaborator-chip" label="Colaboradores" />}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => {
                                        const user = allUsers.find(u => u._id === value);
                                        return <Chip key={value} label={user ? user.name : 'Desconocido'} />;
                                    })}
                                </Box>
                            )}
                        >
                            {allUsers.map((user) => (
                                <MenuItem
                                    key={user._id}
                                    value={user._id}
                                >
                                    <Checkbox color="secondary" checked={selectedAssignedTo.indexOf(user._id) > -1} />
                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography variant="body1">{user.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* SELECTOR DE DEPENDENCIAS */}
                    <FormControl fullWidth>
                        <InputLabel color="secondary" id="dependencies-select-label">Asignar dependencias</InputLabel>
                        <Select
                            color='secondary'
                            labelId="dependencies-select-label"
                            id="dependencies-select"
                            multiple
                            value={selectedDependencies}
                            onChange={(e) => setSelectedDependencies(e.target.value as string[])}
                            input={<OutlinedInput label="Depende de (Tareas)" />}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => {
                                        const task = allTasks.find(t => t._id === value);
                                        return <Chip key={value} label={task ? task.title : 'Desconocido'} />;
                                    })}
                                </Box>
                            )}
                        >
                            {allTasks.map(task => (
                                <MenuItem key={task._id} value={task._id}>
                                    <Checkbox color="secondary" checked={selectedDependencies.indexOf(task._id) > -1} />
                                    <ListItemText primary={task.title} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {/* FIN: SELECTOR DE DEPENDENCIAS */}

                    <TextField
                        color='secondary'
                        label="Fecha de entrega"
                        type="date"
                        variant="outlined"
                        fullWidth
                        value={newDueDate}
                        onChange={(e) => setNewDueDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
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