// src/components/Auth.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  Alert,
} from '@mui/material';

const Auth = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null); // Se corrige 'setSucces'
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null); // Se usa la función corregida
    
    try {
      if (isLogin) {
        // En el backend, ya se manejará el prefijo '/api' del proxy
        const response = await axios.post('/api/auth/login', { email, password });
        login(response.data);
        navigate('/tasks'); // Solo navega después de un login exitoso
      } else {
        // La asignación del rol ahora se maneja en el backend, no en el frontend
        const response = await axios.post('/api/auth/register', { name, email, password });
        
        setSuccess(response.data.message || '¡Registro exitoso! Puedes iniciar sesión ahora.');
        setEmail('');
        setPassword('');
        setName('');
        // Al registrarse, no se navega inmediatamente, se muestra un mensaje
        // para que el usuario inicie sesión.
        setIsLogin(true); 
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ocurrió un error. Inténtalo de nuevo.');
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {!isLogin && (
            <TextField
              label="Nombre completo"
              variant="outlined"
              required
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <TextField
            label="Correo electrónico"
            variant="outlined"
            type="email"
            required
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Contraseña"
            variant="outlined"
            type="password"
            required
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
          </Button>
        </Box>
        <Typography align="center" sx={{ mt: 2 }}>
          {isLogin ? (
            <>
              ¿No tienes una cuenta?{' '}
              <Link component="button" onClick={() => setIsLogin(false)}>
                Regístrate
              </Link>
            </>
          ) : (
            <>
              ¿Ya tienes una cuenta?{' '}
              <Link component="button" onClick={() => {
                setIsLogin(true);
                setSuccess(null);
                setError(null);
              }}>
                Inicia sesión
              </Link>
            </>
          )}
        </Typography>
      </Paper>
    </Container>
  );
};

export default Auth;