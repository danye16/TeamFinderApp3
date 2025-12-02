// src/types/index.ts

// --- INTERFAZ DE USUARIO ---
export interface User {
  id: number;
  username: string; 
  correo: string | null;
  avatarUrl: string | null;
  pais: string;
  edad: number;
  steamId?: string;
  estiloJuego?: string;
  fechaCreacion?: string;
}

export interface UsuarioCreacionDto {
  username: string;
  contraseña: string; // Para crearla, sí se envía
  steamId?: string;
  pais: string;
  edad?: number;
  correo?: string;
  avatarUrl?: string;
  estiloJuego?: string;

}
export interface LoginDto {
  username: string;
  password: string;
}

// --- INTERFAZ DE JUEGO ---
export interface Game {
  id: number;
  nombre: string;
}

// --- INTERFAZ DE EVENTO (LA MÁS IMPORTANTE) ---
export interface Event {
  id: number;
  titulo: string;
  descripcion: string;
  juegoId: number;
  organizadorId: number;
  fechaInicio: string;
  fechaFin: string;
  maxParticipantes: number;
  imagenUrl: string;
  esPublico: boolean;
  fechaCreacion: string;

  // --- ESTAS SON LAS PROPIEDADES QUE TE DEVUELVE TU API ---
  juegoNombre: string;
  organizadorUsername: string;
  cantidadParticipantes: number;
  tieneCuposDisponibles: boolean;

  // --- ESTAS PROPIEDADES ANIDADAS YA NO SE USAN PARA ESTA RESPUESTA ---
  // juego?: Game;
  // organizador?: User;
}

// --- INTERFAZ DE PARTICIPANTE ---
export interface EventParticipant {
  id: number;
  eventoId: number;
  usuarioId: number;
  fechaRegistro: string;
  confirmado: boolean;
  usuario?: User;
}

// --- INTERFAZ DE RESPUESTA DE AUTENTICACIÓN ---
export interface AuthResponse {
  user: User;
  token: string;
}