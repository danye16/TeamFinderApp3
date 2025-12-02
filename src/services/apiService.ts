// src/services/apiService.ts
import type { User, LoginDto, UsuarioCreacionDto, Event, EventParticipant } from '../types';

// URLs base separadas para cada parte de la API
const USER_API_BASE_URL = 'https://teamfinderapiv2.somee.com/api/Usuarios';
const EVENT_API_BASE_URL = 'https://teamfinderapiv2.somee.com/api/EventosGaming';

// Función helper para hacer peticiones
const apiRequest = async (baseUrl: string, endpoint: string, options: RequestInit = {}): Promise<any> => {
  const url = `${baseUrl}${endpoint}`;
  const token = localStorage.getItem('authToken');

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en la petición: ${response.statusText}. ${errorText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Service Error:', error);
    throw error;
  }
};

// --- Endpoints de Usuario ---
export const login = (loginData: LoginDto): Promise<User> => 
  apiRequest(USER_API_BASE_URL, '/Login', {
    method: 'POST',
    body: JSON.stringify(loginData),
  });

export const register = (registerData: UsuarioCreacionDto): Promise<User> => 
  apiRequest(USER_API_BASE_URL, '/CrearUsuario', {
    method: 'POST',
    body: JSON.stringify(registerData),
  });

// --- Endpoints de Eventos ---
export const getEventById = (eventId: string): Promise<Event> => 
  apiRequest(EVENT_API_BASE_URL, `/BuscarPorId/${eventId}`);

export const joinEvent = (body: { eventoId: number; usuarioId: number; nickEnEvento: string; rolElegido: string }): Promise<{ message: string }> => 
  apiRequest(EVENT_API_BASE_URL, '/Unirse', {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const leaveEvent = (eventId: string, userId: string): Promise<{ message: string }> => 
  apiRequest(EVENT_API_BASE_URL, `/Abandonar/${eventId}/${userId}`, { method: 'DELETE' });

export const getParticipants = (eventId: string): Promise<EventParticipant[]> => 
  apiRequest(EVENT_API_BASE_URL, `/Participantes/${eventId}`);

export const createEvent = (eventData: Partial<Event>): Promise<Event> => 
  apiRequest(EVENT_API_BASE_URL, '/CrearEvento', {
    method: 'POST',
    body: JSON.stringify(eventData),
  });