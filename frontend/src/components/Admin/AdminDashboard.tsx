import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  Container, Typography, Box, Paper, CircularProgress, Alert,
  List, ListItem, ListItemText, ListItemSecondaryAction, IconButton,
  Button, TextField, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

//Interfaces para los datos
interface Role {
  _id: string;
  name: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
}

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para la gestión de roles
  const [newRoleName, setNewRoleName] = useState('');
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editingRoleName, setEditingRoleName] = useState('');

  // Estados para la gestión de usuarios
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedNewRoleId, setSelectedNewRoleId] = useState('');

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchUsersAndRoles = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [usersRes, rolesRes] = await Promise.all([
        axios.get('/api/users', config),
        axios.get('/api/roles', config),
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Acceso denegado. No tienes permisos de administrador.');
      } else {
        setError('No se pudieron obtener los datos.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsersAndRoles();
    } else {
      setLoading(false);
      setError('Debes iniciar sesión para ver esta página.');
    }
  }, [token]);

  // --- Lógica de CRUD para Roles ---
  const handleCreateRole = async () => {
    if (newRoleName.trim() === '') return;
    try {
      await axios.post('/api/roles', { name: newRoleName }, config);
      setNewRoleName('');
      fetchUsersAndRoles();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear el rol.');
    }
  };

  const handleEditRoleClick = (role: Role) => {
    setEditingRole(role);
    setEditingRoleName(role.name);
  };

  const handleUpdateRole = async () => {
    if (!editingRole || editingRoleName.trim() === '') return;
    try {
      await axios.put(`/api/roles/${editingRole._id}`, { name: editingRoleName }, config);
      setEditingRole(null);
      setEditingRoleName('');
      fetchUsersAndRoles();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar el rol.');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este rol?')) {
      try {
        await axios.delete(`/api/roles/${roleId}`, config);
        fetchUsersAndRoles();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al eliminar el rol.');
      }
    }
  };

  // CRUD para Usuarios
  const handleEditUserClick = (user: User) => {
    setEditingUser(user);
    setSelectedNewRoleId(user.role._id);
  };

  const handleUpdateUserRole = async () => {
    if (!editingUser || !selectedNewRoleId) return;
    try {
      await axios.put(`/api/users/${editingUser._id}/role`, { roleId: selectedNewRoleId }, config);
      setEditingUser(null);
      fetchUsersAndRoles();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar el rol del usuario.');
    }
  };

  //Renderización del componente
  if (!user || user.role.name !== 'admin') {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Acceso denegado. Esta página es solo para administradores.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Panel de Administración
      </Typography>

      {loading && <CircularProgress sx={{ display: 'block', margin: 'auto' }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && !error && (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 4 }}>
          {/* Sección de Gestión de Roles */}
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Gestión de Roles</Typography>
            <List>
              {roles.map((role) => (
                <ListItem key={role._id} divider>
                  {editingRole && editingRole._id === role._id ? (
                    <>
                      <TextField
                        value={editingRoleName}
                        onChange={(e) => setEditingRoleName(e.target.value)}
                        variant="standard"
                        sx={{ flexGrow: 1 }}
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" onClick={handleUpdateRole} color="primary">
                          <SaveIcon />
                        </IconButton>
                        <IconButton edge="end" onClick={() => setEditingRole(null)}>
                          <CancelIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </>
                  ) : (
                    <>
                      <ListItemText primary={role.name} />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" onClick={() => handleEditRoleClick(role)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteRole(role._id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </>
                  )}
                </ListItem>
              ))}
            </List>
            <Box sx={{ display: 'flex', mt: 2, gap: 1 }}>
              <TextField
                fullWidth
                label="Nombre del Nuevo Rol"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
              />
              <Button variant="contained" onClick={handleCreateRole}>Crear Rol</Button>
            </Box>
          </Paper>

          {/* Sección de Gestión de Usuarios */}
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Gestión de Usuarios</Typography>
            <List>
              {users.map((u) => (
                <ListItem key={u._id} divider>
                  <ListItemText
                    primary={u.name}
                    secondary={`Email: ${u.email} | Rol actual: ${u.role.name}`}
                  />
                  <ListItemSecondaryAction>
                    {editingUser && editingUser._id === u._id ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FormControl variant="standard" sx={{ minWidth: 150 }}>
                          <InputLabel>Nuevo Rol</InputLabel>
                          <Select
                            value={selectedNewRoleId}
                            onChange={(e) => setSelectedNewRoleId(e.target.value as string)}
                          >
                            {roles.map((role) => (
                              <MenuItem key={role._id} value={role._id}>{role.name}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <IconButton onClick={handleUpdateUserRole} color="primary">
                          <SaveIcon />
                        </IconButton>
                        <IconButton onClick={() => setEditingUser(null)}>
                          <CancelIcon />
                        </IconButton>
                      </Box>
                    ) : (
                      <IconButton edge="end" onClick={() => handleEditUserClick(u)}>
                        <EditIcon />
                      </IconButton>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>
      )}
    </Container>
  );
};

export default AdminDashboard;