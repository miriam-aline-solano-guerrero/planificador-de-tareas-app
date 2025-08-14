import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';

interface User {
_id: string;
name: string;
email: string;
role: { name: string; _id: string };
token: string;
}

interface AuthContextType {
 user: User | null;
 token: string | null;
 // Añadimos una variable de estado para saber si el usuario es admin.
 isAdmin: boolean;
 login: (userData: User) => void;
 logout: () => void;
 loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
 const [user, setUser] = useState<User | null>(null);
 const [token, setToken] = useState<string | null>(null);
 const [loading, setLoading] = useState(true);
 // --- NUEVO ESTADO: para saber si es admin ---
 const [isAdmin, setIsAdmin] = useState(false);

 useEffect(() => {
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('token');

  if (storedUser && storedToken) {
   try {  
    const parsedUser: User = JSON.parse(storedUser);
    setUser(parsedUser);
    setToken(storedToken);
    
    // --- LÓGICA AGREGADA: Verificamos el rol al cargar desde localStorage ---
    setIsAdmin(parsedUser.role.name === 'admin');
    axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
  } catch (e) {
    console.error('Failed to parse user data from localStorage', e);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
 }
 } setLoading(false) }, []);

  const login = (userData: User) => {
 setUser(userData);
 setToken(userData.token);
 // --- LÓGICA AGREGADA: Verificamos el rol al iniciar sesión ---
 setIsAdmin(userData.role.name === 'admin');
 localStorage.setItem('user', JSON.stringify(userData));
 localStorage.setItem('token', userData.token);
 axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
 };

 const logout = () => {
  setUser(null);
  setToken(null);
  // --- LÓGICA AGREGADA: Reseteamos el estado de admin al cerrar sesión ---
  setIsAdmin(false);
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  delete axios.defaults.headers.common['Authorization'];
 };

return (
 <AuthContext.Provider value={{ user, token, isAdmin, login, logout, loading }}>
 {children}
  </AuthContext.Provider>
 );
};

export const useAuth = () => {
const context = useContext(AuthContext);
 if (context === undefined) {
 throw new Error('useAuth must be used within an AuthProvider');
 }
 return context;
};