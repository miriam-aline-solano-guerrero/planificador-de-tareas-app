import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import UserManagement from '../UserManagement'; 

const AdminDashboard: React.FC = () => {
    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                Gestión de usuarios y roles
            </Typography>
            <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
                <UserManagement />
            </Paper>
        </Box>
    );
};

export default AdminDashboard;