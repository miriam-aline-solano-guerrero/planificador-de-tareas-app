import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import { useAuth } from './context/AuthContext';
import { Container, Box, Button, Typography, Paper } from '@mui/material';
import './App.css';

function App() {
  const { user } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Planificador de Tareas
        </Typography>

        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          {user ? (
            <Dashboard />
          ) : (
            <>
              {showRegister ? <Register /> : <Login />}

              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {showRegister ? "¿Ya tienes una cuenta?" : "¿No tienes una cuenta?"}
                </Typography>
                <Button onClick={() => setShowRegister(!showRegister)}>
                  {showRegister ? "Iniciar Sesión" : "Registrarme"}
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
}

export default App;