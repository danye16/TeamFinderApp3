// src/pages/CreateEventPage.tsx

// --- IMPORTS CORRECTOS PARA VITE + TYPESCRIPT ---
import React, { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react'; // <-- TIPOS, importados con 'type'
import { useAuth } from '../context/AuthContext';
import { createEvent } from '../services/apiService';
import type { Event } from '../types';
import Header from '../components/Header';

interface FormData {
  titulo: string;
  descripcion: string;
  juegoId: number;
  fechaInicio: string;
  fechaFin: string;
  maxParticipantes: number;
  imagenUrl: string;
  esPublico: boolean;
}

const CreateEventPage: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    titulo: '',
    descripcion: '',
    juegoId: 1,
    fechaInicio: '',
    fechaFin: '',
    maxParticipantes: 10,
    imagenUrl: '',
    esPublico: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // --- NUEVO ESTADO PARA GUARDAR EL ID DEL EVENTO CREADO ---
  const [createdEventId, setCreatedEventId] = useState<number | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // --- NUEVA FUNCIÓN PARA COMPARTIR ---
  const handleShare = async () => {
    if (!createdEventId) return; // No hacer nada si no hay un ID

    const shareUrl = `${window.location.origin}/evento/${createdEventId}`;
    const shareData = {
      title: formData.titulo || 'Nuevo evento en TeamFinder',
      text: `¡Únete a mi evento ${formData.titulo} en TeamFinder!`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error al compartir:', err);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('¡Enlace copiado al portapapeles!');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      setMessage('Debes iniciar sesión para crear un evento.');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setCreatedEventId(null); // Reseteamos el ID por si se crea otro evento

    const payload = {
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      juegoId: formData.juegoId,
      organizadorId: user.id,
      maxParticipantes: formData.maxParticipantes,
      imagenUrl: formData.imagenUrl,
      esPublico: formData.esPublico,
      fechaInicio: new Date(formData.fechaInicio).toISOString(),
      fechaFin: new Date(formData.fechaFin).toISOString(),
    };

    try {
      const newEvent: Event = await createEvent(payload);
      // --- ¡GUARDAMOS EL ID DEL EVENTO CREADO! ---
      setCreatedEventId(newEvent.id);
      setMessage(`¡Éxito! Evento "${newEvent.titulo}" creado. Usa el botón de COMPARTIR de arriba.`);
    } catch (error) {
      setMessage('Error al crear el evento. Revisa los datos y la consola (F12).');
      console.error('Error detallado al crear evento:', error);
    } finally {
      setIsLoading(false);
    }
  };
;

  return (
    <div className="container">
      {/* --- LE PASAMOS LA FUNCIÓN AL HEADER --- */}
      <Header onShare={handleShare} />
      
      <h1 style={{ fontFamily: 'var(--font-header)', color: 'var(--accent-yellow)' }}>CREAR NUEVO EVENTO</h1>
      <form onSubmit={handleSubmit} className="event-creation-form">
        {/* ... (todo el formulario se queda igual) ... */}
        <div className="form-group">
          <label htmlFor="titulo">TÍTULO DEL EVENTO</label>
          <input 
            type="text" 
            id="titulo" 
            name="titulo" 
            value={formData.titulo} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="descripcion">Reglas</label>
          <textarea 
            id="descripcion" 
            name="descripcion" 
            value={formData.descripcion} 
            onChange={handleChange} 
            required
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="fechaInicio">FECHA Y HORA DE INICIO</label>
          <input 
            type="datetime-local" 
            id="fechaInicio" 
            name="fechaInicio" 
            value={formData.fechaInicio} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="fechaFin">FECHA Y HORA DE FIN</label>
          <input 
            type="datetime-local" 
            id="fechaFin" 
            name="fechaFin" 
            value={formData.fechaFin} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="maxParticipantes">MÁXIMO DE PARTICIPANTES</label>
          <input 
            type="number" 
            id="maxParticipantes" 
            name="maxParticipantes" 
            value={formData.maxParticipantes} 
            onChange={handleChange} 
            min="2"
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="imagenUrl">URL DE LA IMAGEN (Opcional)</label>
          <input 
            type="url" 
            id="imagenUrl" 
            name="imagenUrl" 
            value={formData.imagenUrl} 
            onChange={handleChange} 
          />
        </div>
        <div className="form-group">
          <label htmlFor="esPublico">
            <input 
              type="checkbox" 
              id="esPublico" 
              name="esPublico" 
              checked={formData.esPublico} 
              onChange={handleChange} 
            />
            Evento público
          </label>
        </div>
        
        <button type="submit" className="cta-button join" disabled={isLoading}>
          {isLoading ? 'CREANDO...' : '¡CREAR EVENTO!'}
        </button>
      </form>
      {message && <p className="form-message">{message}</p>}
    </div>
  );
};

export default CreateEventPage;