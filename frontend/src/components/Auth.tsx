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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isLogin) {
        const response = await axios.post('/api/auth/login', { email, password });
        // COMBINAMOS los datos del usuario y el token en un solo objeto
        const userWithToken = { ...response.data.user, token: response.data.token };
        login(userWithToken);
      } else {
        const response = await axios.post('/api/auth/register', { name, email, password });
        // COMBINAMOS los datos del usuario y el token en un solo objeto
        const userWithToken = { ...response.data.user, token: response.data.token };
        login(userWithToken);
      }
      navigate('/tasks');
    } catch (err: any) {
      console.error(err);
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
              <Link component="button" onClick={() => setIsLogin(true)}>
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