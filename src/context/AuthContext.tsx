// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import type { User, LoginDto, UsuarioCreacionDto } from '../types'; // <-- Usamos los DTOs
import { login, register } from '../services/apiService'; // <-- Importamos las funciones correctas

interface AuthContextType {
  user: User | null;
  isAuthLoading: boolean;
  login: (userData: { user: User; token: string }) => void; // Para el login de la app nativa
  logout: () => void;
  handleLogin: (loginData: LoginDto) => Promise<{ success: boolean; error?: string }>; // Para el login del modal
  handleRegister: (registerData: UsuarioCreacionDto) => Promise<{ success: boolean; error?: string }>; // Para el registro
  handleDiscordLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Aquí deberías tener un endpoint para validar el token y obtener los datos del usuario
      // Por ahora, si hay token, asumimos que el usuario es válido
      // setUser({ id: 1, username: 'UsuarioGuardado', ... });
    }
    setIsAuthLoading(false);
  }, []);

  // Esta función es para cuando la app nativa (React Native) pasa las credenciales
  const login = (userData: { user: User; token: string }) => {
    localStorage.setItem('authToken', userData.token);
    setUser(userData.user);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  // Esta función es para el login desde el modal de la PWA
  const handleLogin = async (loginData: LoginDto) => {
    try {
      const user = await login(loginData); // Llama a la API de login
      // IMPORTANTE: Tu API de login no devuelve un token. Esto es un problema de seguridad.
      // Lo manejaremos así por ahora, pero deberías pedir a tu backend que devuelva un token.
      login({ user, token: 'fake-token-sin-backend' });
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Usuario o contraseña incorrectos.' };
    }
  };

  // Esta función es para el registro desde el modal de la PWA
  const handleRegister = async (registerData: UsuarioCreacionDto) => {
    try {
      const newUser = await register(registerData); // Llama a la API de registro
      login({ user: newUser, token: 'fake-token-sin-backend' });
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error al registrar. El usuario ya podría existir.' };
    }
  };
  
  const handleDiscordLogin = () => {
    // Por ahora, no implementamos el login con Discord
    console.log('Login con Discord no implementado aún.');
  };

  const value: AuthContextType = {
    user,
    isAuthLoading,
    login,
    logout,
    handleLogin,
    handleRegister,
    handleDiscordLogin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};