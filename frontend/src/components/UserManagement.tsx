import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'
import axios from 'axios';
import { Box, Typography, List, ListItem, ListItemText, Select, MenuItem, SelectChangeEvent } from '@mui/material';

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

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            try {
                // Endpoint para obtener todos los usuarios (solo para admins)
                const usersResponse = await axios.get<User[]>('/api/users', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUsers(usersResponse.data);

                // Endpoint para obtener todos los roles (para el dropdown)
                const rolesResponse = await axios.get<Role[]>('/api/roles', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRoles(rolesResponse.data);
            } catch (error) {
                console.error('Error al obtener datos de usuarios o roles:', error);
            }
        };
        fetchData();
    }, [token]);

    const handleRoleChange = async (event: SelectChangeEvent<string>, userId: string) => {
        const newRoleId = event.target.value;
        try {
            // Endpoint para actualizar el rol de un usuario
            await axios.put(`/api/users/${userId}/role`, { roleId: newRoleId }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Actualiza el estado local para reflejar el cambio
            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user._id === userId ? { ...user, role: roles.find(r => r._id === newRoleId)! } : user
                )
            );
        } catch (error) {
            console.error('Error al actualizar el rol:', error);
        }
    };

    return (
        <Box>
            <List>
                {users.map(user => (
                    <ListItem key={user._id} divider>
                        <ListItemText primary={user.email} secondary={`Rol actual: ${user.role.name}`} />
                        <Select
                            value={user.role._id}
                            onChange={(e) => handleRoleChange(e, user._id)}
                            variant="standard"
                        >
                            {roles.map(role => (
                                <MenuItem key={role._id} value={role._id}>
                                    {role.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default UserManagement;