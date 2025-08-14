import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Auth from './components/Auth';
import TaskDashboard from './components/TaskDashboard';
import TaskForm from './components/TaskForm';
//import TaskProgress from './components/TaskProgress';
import Home from './components/Home';
import { Container, Box } from '@mui/material';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Box mt={2}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tasks" element={<TaskDashboard />} />
              <Route path="/tasks/create" element={<TaskForm />} /> 
              <Route path="/tasks/edit/:taskId" element={<TaskForm />} /> 
              <Route path="/login" element={<Auth />} />
            </Routes>
          </Box>
        </Container>
      </AuthProvider>
    </Router>
  );
}

export default App;