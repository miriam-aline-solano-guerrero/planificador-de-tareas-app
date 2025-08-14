import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, Box } from '@mui/material';

// Importaciones de Context y Componentes
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Auth from './components/Auth';
import TaskDashboard from './components/TaskDashboard';
import TaskForm from './components/TaskForm';
import Home from './components/Home';

// Importa los nuevos componentes de ruta
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './components/Admin/AdminDashboard';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Box mt={2}>
            <Routes>
              {/* Rutas públicas */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Auth />} />

              {/* Rutas protegidas para usuarios autenticados */}
              <Route path="/tasks" element={<PrivateRoute><TaskDashboard /></PrivateRoute>} />
              <Route path="/tasks/create" element={<PrivateRoute><TaskForm /></PrivateRoute>} />
              <Route path="/tasks/edit/:taskId" element={<PrivateRoute><TaskForm /></PrivateRoute>} />
              
              {/* Ruta exclusiva para administradores */}
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

            </Routes>
          </Box>
        </Container>
      </AuthProvider>
    </Router>
  );
};

export default App;