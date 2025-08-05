import React, { useState } from 'react';
import axios from 'axios';
import { Container, Typography, TextField, Button, Box, Alert } from '@mui/material';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // ID de rol 'user' a cada nuevousuario se le agrega por default en este rol
      const roleId = '6891131eeca30687ecf9dab4';

      if (!roleId) {
        setError('No se pudo encontrar un rol para registrar al usuario.');
        return;
      }

      const response = await axios.post('/api/auth/register', { email, password, roleId });
      setSuccess(response.data.message || '¡Registro exitoso! Puedes iniciar sesión ahora.');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Ocurrió un error al intentar registrarte.');
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Registrarse
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email-reg"
            label="Correo Electrónico"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Contraseña"
            type="password"
            id="password-reg"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Registrarse
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;