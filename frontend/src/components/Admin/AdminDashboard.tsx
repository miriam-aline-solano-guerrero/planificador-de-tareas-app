import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import UserManagement from '../UserManagement'; 

const AdminDashboard: React.FC = () => {
    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                Panel de Administración
            </Typography>
            <Typography variant="body1" paragraph>
                Bienvenido, administrador. Desde aquí puedes gestionar los usuarios y sus roles.
            </Typography>

            <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    Gestión de Usuarios
                </Typography>
                <UserManagement />
            </Paper>
        </Box>
    );
};

export default AdminDashboard;