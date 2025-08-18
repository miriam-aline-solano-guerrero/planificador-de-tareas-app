import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const Home = () => {

  return (
    <Container maxWidth="md">
      <Box textAlign="center" mt={5}>
        <Typography variant="h2" component="h1" gutterBottom>
          PLANIFICADOR DE TAREAS
        </Typography>
        <Typography variant="h5" component="p" color="text.secondary">
          Gestión de roles, usuarios y tareas:)
        </Typography>
        </Box>
        
    </Container>
  )};

export default Home;