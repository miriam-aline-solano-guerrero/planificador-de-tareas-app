import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Typography, Button, Box } from '@mui/material';
import TaskDashboard from './TaskDashboard'; 

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <Box sx={{ mt: 4, textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>
        ¡Bienvenido, {user?.email}!
      </Typography>
      <Button variant="contained" color="secondary" onClick={logout} sx={{ mt: 2, mb: 4 }}>
        Cerrar Sesión
      </Button>
      <TaskDashboard /> {/* <-- Muestra el componente de tareas */}
    </Box>
  );
};

export default Dashboard;