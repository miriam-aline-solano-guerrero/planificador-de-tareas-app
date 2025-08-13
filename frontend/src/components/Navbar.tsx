import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddTaskIcon from '@mui/icons-material/AddTask';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'; 
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleLogout = () => {
    logout();
    navigate('/login'); // <-- Corregido para redirigir a la ruta correcta
  };

  let menuItems = [
    { text: 'Dashboard de Tareas', path: '/tasks', icon: <DashboardIcon /> },
    { text: 'Crear Tarea', path: '/tasks/create', icon: <AddTaskIcon /> },
    { text: 'Avances', path: '/progress', icon: <TrendingUpIcon /> },
  ];

  if (!loading && user && user.role && user.role.name === 'admin') {
    menuItems.push({
      text: 'Panel de Administración',
      path: '/admin',
      icon: <AdminPanelSettingsIcon />,
    });
  }

  const drawerList = () => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} component={Link} to={item.path}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <AppBar color="secondary" position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            App de Tareas
          </Link>
        </Typography>

        {!loading ? (
          user ? (
            <>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2 }}
                onClick={toggleDrawer(true)}
              >
                <MenuIcon />
              </IconButton>
              <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
                {drawerList()}
              </Drawer>
              <Button color="inherit" onClick={handleLogout}>Cerrar Sesión</Button>
            </>
          ) : (
            <Button color="inherit" component={Link} to="/login">
              Iniciar Sesión
            </Button>
          )
        ) : null}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;