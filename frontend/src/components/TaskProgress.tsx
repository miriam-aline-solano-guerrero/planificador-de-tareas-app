import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const TaskProgress = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Avances del Proyecto
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Aquí podrás ver estadísticas, gráficos y el progreso general de tus tareas.
          ¡Esta sección está en desarrollo!
        </Typography>
      </Box>
    </Container>
  );
};

export default TaskProgress;