import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
    Box, Typography, List, ListItem, ListItemText, Select, MenuItem, SelectChangeEvent,
    Paper, Button, TextField, Alert, IconButton,
    FormControl,
    InputLabel,
    Chip,
    Checkbox
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

// Interfaces para los tipos de datos
interface Role {
    _id: string;
    name: string;
}

interface User {
    _id: string;
    email: string;
    role: Role;
}

const UserManagement: React.FC = () => {
    const { token } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    // --- NUEVOS ESTADOS ---
    const [newRoleName, setNewRoleName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserRole, setNewUserRole] = useState('');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    //permisos roles
    const [newRolePermissions, setNewRolePermissions] = useState<string[]>([]); // Nuevo estado para los permisos
    const [allPermissions, setAllPermissions] = useState<string[]>([]); // Nuevo estado para todos los permisos disponibles
    
    // Configuración para las peticiones de Axios
    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    // Funciones de obtención de datos
    const fetchUsers = async () => {
        try {
            const usersResponse = await axios.get<User[]>('/api/users', config);
            setUsers(usersResponse.data);
        } catch (error) {
            setErrorMessage('Error al obtener la lista de usuarios.');
            console.error(error);
        }
    };

    const fetchRoles = async () => {
        try {
            const rolesResponse = await axios.get<Role[]>('/api/roles', config);
            setRoles(rolesResponse.data);
        } catch (error) {
            setErrorMessage('Error al obtener la lista de roles.');
            console.error(error);
        }
    };


    const fetchPermissions = async () => {
        try {
            const res = await axios.get('/api/roles/permissions', config);
            setAllPermissions(res.data);
        } catch (err) {
            setErrorMessage('No se pudo cargar la lista de permisos.');
            console.error(err);
        }
    };

    // Efecto para cargar datos al inicio
    useEffect(() => {
        if (!token) return;
        fetchUsers();
        fetchRoles();
        fetchPermissions();
    }, [token]);

    // Lógica para actualizar rol de usuario (ya la tenías)
    const handleRoleChange = async (event: SelectChangeEvent<string>, userId: string) => {
        const newRoleId = event.target.value;
        try {
            await axios.put(`/api/users/${userId}/role`, { roleId: newRoleId }, config);
            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user._id === userId ? { ...user, role: roles.find(r => r._id === newRoleId)! } : user
                )
            );
            setSuccessMessage('Rol de usuario actualizado.');
        } catch (error) {
            setErrorMessage('Error al actualizar el rol.');
            console.error(error);
        }
    };

    // --- LÓGICA AGREGADA PARA LA GESTIÓN DE ROLES ---
    const handleCreateRole = async () => {
        if (!newRoleName) {
            setErrorMessage('El nombre del rol es obligatorio.');
            return;
        }
        try {
            await axios.post('/api/roles', { 
                name: newRoleName, 
                permissions: newRolePermissions
            }, config);
            setNewRoleName('');
            setNewRolePermissions([]);
            setSuccessMessage('Rol creado exitosamente.');
            fetchRoles(); // Recargar la lista de roles
        } catch (error) {
            setErrorMessage('Error al crear el rol.');
            console.error(error);
        }
    };

    const handleDeleteRole = async (roleId: string) => {
        try {
            await axios.delete(`/api/roles/${roleId}`, config);
            setSuccessMessage('Rol eliminado exitosamente.');
            fetchRoles(); // Recargar la lista de roles
        } catch (error) {
            setErrorMessage('Error al eliminar el rol.');
            console.error(error);
        }
    };

    // --- LÓGICA AGREGADA PARA LA GESTIÓN DE USUARIOS ---
    const handleCreateUser = async () => {
        if (!newUserEmail || !newUserPassword || !newUserRole) {
            setErrorMessage('Todos los campos de usuario son obligatorios.');
            return;
        }
        try {
            await axios.post('/api/users', { email: newUserEmail, password: newUserPassword, role: newUserRole }, config);
            setNewUserEmail('');
            setNewUserPassword('');
            setNewUserRole('');
            setSuccessMessage('Usuario creado exitosamente.');
            fetchUsers(); // Recargar la lista de usuarios
        } catch (error) {
            setErrorMessage('Error al crear el usuario.');
            console.error(error);
        }
    };
    
    const handleDeleteUser = async (userId: string) => {
        try {
            await axios.delete(`/api/users/${userId}`, config);
            setSuccessMessage('Usuario eliminado exitosamente.');
            fetchUsers(); // Recargar la lista de usuarios
        } catch (error) {
            setErrorMessage('Error al eliminar el usuario.');
            console.error(error);
        }
    };
    
    // La interfaz de usuario (JSX)
    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>Panel de Administración</Typography>
            {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
            {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}

            {/* --- Sección de Gestión de Roles --- */}
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h5" gutterBottom>Gestión de Roles</Typography>
                <Box sx={{ display: 'flex', flexDirection:'column', gap: 2, mb: 2 }}>
                    <TextField
                        label="Nombre del Nuevo Rol"
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value)}
                        fullWidth
                    />
                    {/* --- NUEVO COMPONENTE DE SELECCIÓN DE PERMISOS --- */}
                    <FormControl fullWidth>
                    <InputLabel>Permisos</InputLabel>
                    <Select
                    multiple
                    value={newRolePermissions}
                    onChange={(e) => setNewRolePermissions(e.target.value as string[])}
                    renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                            <Chip key={value} label={value} />
                        ))}
                    </Box>
                )}
            >
                {allPermissions.map((permission) => (
                    <MenuItem key={permission} value={permission}>
                        <Checkbox checked={newRolePermissions.indexOf(permission) > -1} />
                        <ListItemText primary={permission} />
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
        {/* --- FIN DEL NUEVO COMPONENTE --- */}
                    <Button variant="contained" color="primary" onClick={handleCreateRole}>
                        Crear Rol
                    </Button>
                </Box>
                <List>
                    {roles.map(role => (
                        <ListItem key={role._id} secondaryAction={
                            <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteRole(role._id)}>
                                <DeleteIcon />
                            </IconButton>
                        }>
                            <ListItemText primary={role.name} />
                        </ListItem>
                    ))}
                </List>
            </Paper>

            {/* --- Sección de Gestión de Usuarios --- */}
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>Gestión de Usuarios</Typography>
                <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                    <TextField
                        label="Email del Nuevo Usuario"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                    />
                    <TextField
                        label="Contraseña del Nuevo Usuario"
                        type="password"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                    />
                    <Select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value)}
                        displayEmpty
                    >
                        <MenuItem value="" disabled>Seleccionar Rol</MenuItem>
                        {roles.map(role => (
                            <MenuItem key={role._id} value={role._id}>{role.name}</MenuItem>
                        ))}
                    </Select>
                    <Button variant="contained" color="primary" onClick={handleCreateUser}>
                        Crear Usuario
                    </Button>
                </Box>
                <List>
                    {users.map(user => (
                        <ListItem key={user._id} divider secondaryAction={
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Select
                                    value={user.role._id}
                                    onChange={(e) => handleRoleChange(e, user._id)}
                                    variant="standard"
                                >
                                    {roles.map(role => (
                                        <MenuItem key={role._id} value={role._id}>{role.name}</MenuItem>
                                    ))}
                                </Select>
                                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteUser(user._id)}>
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        }>
                            <ListItemText primary={user.email} secondary={`Rol actual: ${user.role.name}`} />
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </Box>
    );
};

export default UserManagement;