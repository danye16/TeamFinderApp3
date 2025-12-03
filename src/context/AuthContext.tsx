// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginDto, UsuarioCreacionDto } from '../types';

// 1. IMPORTANTE: Renombramos aquí para evitar el conflicto con tu función local 'login'
import { login as loginService, register as registerService } from '../services/apiService'; 

interface AuthContextType {
  user: User | null;
  isAuthLoading: boolean;
  login: (userData: { user: User; token: string }) => void; // Función local
  logout: () => void;
  handleLogin: (loginData: LoginDto) => Promise<{ success: boolean; error?: string }>;
  handleRegister: (registerData: UsuarioCreacionDto) => Promise<{ success: boolean; error?: string }>;
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
    // Como tu API no valida tokens, si existe en localStorage asumimos que hay sesión.
    // (Idealmente aquí validarías contra un endpoint /Me, pero tu API no lo tiene aún)
    setIsAuthLoading(false);
  }, []);

  // --- FUNCIÓN LOCAL: Actualiza el estado de React y guarda en localStorage ---
  const login = (userData: { user: User; token: string }) => {
    localStorage.setItem('authToken', userData.token);
    setUser(userData.user);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  // --- HANDLE LOGIN: Conecta el Formulario -> API -> Estado Local ---
  const handleLogin = async (loginData: LoginDto) => {
    try {
      // 1. Llamamos a la API (usando el nombre renombrado)
      const userFromApi = await loginService(loginData); 
      
      // 2. Como tu API no devuelve token, generamos uno falso para que la app crea que hay sesión
      const fakeToken = 'token-simulado-' + userFromApi.id;

      // 3. Guardamos en el estado local
      login({ user: userFromApi, token: fakeToken }); 
      
      return { success: true };
    } catch (error) {
      console.error("Error en login:", error);
      return { success: false, error: 'Usuario o contraseña incorrectos.' };
    }
  };

  // --- HANDLE REGISTER: Conecta el Formulario -> API -> Estado Local ---
  const handleRegister = async (registerData: UsuarioCreacionDto) => {
    try {
      // 1. Llamamos a la API (usando el nombre renombrado)
      const newUser = await registerService(registerData); 
      
      // 2. Generamos el token falso
      const fakeToken = 'token-simulado-' + newUser.id;

      // 3. Iniciamos sesión automáticamente tras el registro
      login({ user: newUser, token: fakeToken });
      
      return { success: true };

    } catch (error: any) {
      console.error("Error en registro:", error);
      // Devolvemos el mensaje de error real para mostrarlo en el modal
      return { success: false, error: error.message || 'Error al conectar con el servidor.' };
    }
  };
  
  const handleDiscordLogin = () => {
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