// src/pages/EventPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useEvent } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

// --- COMPONENTES ---
import Header from '../components/Header';
import Hero from '../components/Hero';
import InfoCards from '../components/InfoCards';
import CtaButton from '../components/CtaButton';
import ParticipantsSection from '../components/ParticipantsSection';
import RulesSection from '../components/RulesSection';
import AuthModal from '../components/AuthModal';
import JoinEventModal from '../components/JoinEventModal';
// --- ELIMINAMOS ESTA LÍNEA ---
// import MockLogin from '../components/MockLogin'; // Ya no es necesario

const EventPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user, login } = useAuth();
  const { addNotification } = useNotification();
  
  const { 
    event, 
    participants, 
    loading, 
    error, 
    isOffline,
    loadEventData, 
    handleJoinEvent,      
    handleLeaveEvent,     
  } = useEvent();

  const isUserJoined = user && participants.some(p => p.usuarioId === user.id);

  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);

  useEffect(() => {
    if (eventId) {
      loadEventData(eventId);
      localStorage.setItem('last_viewed_event_id', eventId);
    }
  }, [eventId, loadEventData]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'AUTH_CREDENTIALS') {
        const { user: userData, token } = event.data.payload;
        localStorage.setItem('authToken', token);
        login({ user: userData, token });
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [login]);

  const handleShare = async () => {
    if (!event) return;
    const shareData = {
      title: event.titulo,
      text: `¡Únete a mi evento ${event.titulo} en TeamFinder!`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error al compartir:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      addNotification('¡Enlace copiado al portapapeles!', 'success');
    }
  };

  const handleJoinClick = useCallback(() => {
    if (!user) {
      // Si no hay usuario, abrimos el modal de login/registro
      setIsAuthModalVisible(true);
      return;
    }
    // Si ya hay usuario, abrimos el modal para unirse
    setIsJoinModalVisible(true);
  }, [user]);

  const handleConfirmJoin = useCallback(async (nickEnEvento: string, rolElegido: string) => {
    setIsJoinModalVisible(false);
    // Nos aseguramos que el usuario exista antes de llamar a la API
    if (!user) {
        addNotification('Error: No se encontró la sesión del usuario.', 'error');
        return;
    }
    try {
      // Pasamos el objeto `user` completo, tu `EventContext` ya sabe cómo usar el `user.id`
      await handleJoinEvent(user, nickEnEvento, rolElegido);
      addNotification('¡Te has unido al evento con éxito!', 'success');
    } catch (err) {
      addNotification('No pudiste unirte al evento. Inténtalo de nuevo.', 'error');
    }
  }, [user, handleJoinEvent, addNotification]);

  const handleLeaveClick = useCallback(async () => {
    if (!user) return;
    try {
      await handleLeaveEvent(user);
      addNotification('Has abandonado el evento.', 'info');
    } catch (err) {
      addNotification('No pudiste abandonar el evento. Inténtalo de nuevo.', 'error');
    }
  }, [user, handleLeaveEvent, addNotification]);

  const handleLoginSuccess = useCallback(() => {
    setIsAuthModalVisible(false);
    // Después de un login exitoso, mostramos el modal para unirse al evento
    setIsJoinModalVisible(true);
  }, []);

  if (loading) {
    return <div className="container"><h2>CARGANDO EVENTO...</h2></div>;
  }

  if (error) {
    return <div className="container"><h2 style={{ color: 'var(--accent-red)' }}>{error}</h2></div>;
  }

  if (!event) {
    return null;
  }

  const infoCardsData = [
    { icon: '📅', label: 'FECHA Y HORA', value: new Date(event.fechaInicio).toLocaleString() },
    { icon: '🎮', label: 'JUEGO', value: event.juegoNombre || 'Cargando...' },
    { icon: '👥', label: 'PARTICIPANTES', value: `${event.cantidadParticipantes} / ${event.maxParticipantes} Equipos` },
    { icon: '🏆', label: 'PREMIO', value: 'Insignia Exclusiva' },
    { icon: '👤', label: 'ORGANIZADOR', value: event.organizadorUsername || 'Cargando...' },
  ];

  return (
    <div className="container">
      {isOffline && (
        <div style={{
            background: '#ffcc00', 
            color: '#333', 
            padding: '10px', 
            textAlign: 'center', 
            fontWeight: 'bold', 
            marginBottom: '10px',
            borderRadius: '4px'
        }}>
           ⚠️ Modo Sin Conexión: Estás viendo datos guardados.
        </div>
      )}
      <Header onShare={handleShare} />
      <Hero title={event.titulo} status="ABIERTO" />
      <InfoCards cardsData={infoCardsData} />
      
      <CtaButton 
        title={isUserJoined ? "YA ESTÁS INSCRITO" : "¡UNIRSE AL TORNEO!"}
        onClick={isUserJoined ? handleLeaveClick : handleJoinClick}
        isJoined={isUserJoined}
      />

      {isUserJoined && (
         <CtaButton 
            title="ABANDONAR EVENTO"
            onClick={handleLeaveClick}
            isJoined={false}
        />
      )}

      <ParticipantsSection participants={participants} />
      <RulesSection descripcion={event.descripcion} />

      {/* --- MODALES --- */}
      <AuthModal 
        isVisible={isAuthModalVisible}
        onClose={() => setIsAuthModalVisible(false)}
        onLoginSuccess={handleLoginSuccess}
      />
      <JoinEventModal
        isVisible={isJoinModalVisible}
        onClose={() => setIsJoinModalVisible(false)}
        onConfirm={handleConfirmJoin}
      />
    </div>
  );
};

export default EventPage;