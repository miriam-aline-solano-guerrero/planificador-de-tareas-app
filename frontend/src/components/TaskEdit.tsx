import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    Modal, Box, Typography, TextField, Button, Alert, FormControl, InputLabel, Select, MenuItem, Checkbox, Chip, OutlinedInput
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Task } from './TaskDashboard'; // Importamos la interfaz Task del dashboard

interface User {
    _id: string;
    email: string;
    name: string;
    role: { name: string; _id: string };
}

interface TaskEditFormModalProps {
    open: boolean;
    handleClose: () => void;
    task: Task;
}

const TaskEdit: React.FC<TaskEditFormModalProps> = ({ open, handleClose, task }) => {
    const { token } = useAuth();
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || '');
    const [activities, setActivities] = useState(task.activities.map(a => a.name) || []);
    const [newActivityInput, setNewActivityInput] = useState('');
    const [dueDate, setDueDate] = useState(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [selectedAssignedTo, setSelectedAssignedTo] = useState(task.assignedTo?.map(u => u._id) || []);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    useEffect(() => {
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
    }, [token]);

    const handleUpdateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !token) {
            setError('El título es obligatorio y debe estar autenticado.');
            return;
        }

        const taskData = {
            title: title,
            description: description,
            activities: activities,
            dueDate: dueDate || undefined,
            assignedTo: selectedAssignedTo,
        };

        try {
            await axios.put(`/api/tasks/${task._id}`, taskData, config);
            setSuccess('Tarea actualizada exitosamente.');
            setError(null);
            setTimeout(() => {
                handleClose();
            }, 1000);
        } catch (err: any) {
            console.error('Error al guardar la tarea:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'No se pudo guardar la tarea.');
            setSuccess(null);
        }
    };

    const handleAddActivity = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' && newActivityInput.trim() !== '') {
            e.preventDefault();
            setActivities(prevActivities => [...prevActivities, newActivityInput.trim()]);
            setNewActivityInput('');
        }
    };

    const handleDeleteActivity = (activityToDelete: string) => {
        setActivities(prevActivities => prevActivities.filter(activity => activity !== activityToDelete));
    };

    const handleCollaboratorChange = (event: any) => {
        const {
            target: { value },
        } = event;
        setSelectedAssignedTo(
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 600,
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <Typography variant="h5" component="h2" gutterBottom align="center">
                    Editar Tarea
                </Typography>
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Box component="form" onSubmit={handleUpdateTask} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        color="secondary"
                        label="Título de la tarea"
                        variant="outlined"
                        required
                        fullWidth
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <TextField
                        color='secondary'
                        label="Descripción"
                        variant="outlined"
                        multiline
                        rows={1}
                        fullWidth
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
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
                            {activities.map((activity, index) => (
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
                            input={<OutlinedInput id="select-collaborator-chip" label="Asignar a:" />}
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

                    <TextField
                        color='secondary'
                        label="Fecha de entrega"
                        type="date"
                        variant="outlined"
                        fullWidth
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button type="submit" variant="outlined" color="success">
                            Guardar Cambios
                        </Button>
                        <Button variant="outlined" color="error" onClick={handleClose}>
                            Cancelar
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
};

export default TaskEdit;