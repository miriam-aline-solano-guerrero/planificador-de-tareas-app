import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

interface AdminProtectedRouteProps {
  children: ReactNode;
}

const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const { user, loading } = useAuth(); 

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Si el usuario no existe O si existe pero no es un admin
  if (!user || !user.role || user.role.name !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  // Si el usuario es un admin, renderiza
  return <>{children}</>;
};

export default AdminProtectedRoute;