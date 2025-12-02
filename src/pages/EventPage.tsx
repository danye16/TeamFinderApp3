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
import AuthModal from '../components/AuthModal'; // El modal de Login/Register
import JoinEventModal from '../components/JoinEventModal';
import MockLogin from '../components/MockLogin'; // Para desarrollo

const EventPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user, login } = useAuth();
  const { addNotification } = useNotification();
  
  // --- OBTENEMOS TODA LA LÓGICA DEL EVENTO DESDE EL CONTEXTO ---
  const { 
    event, 
    participants, 
    loading, 
    error, 
    isOffline,
    loadEventData, 
    handleJoinEvent,      // <-- Función para unirse (viene del contexto)
    handleLeaveEvent,     // <-- Función para abandonar (viene del contexto)
  } = useEvent();

  // --- CALCULAMOS SI EL USUARIO ESTÁ UNIDO AQUÍ ---
  const isUserJoined = user && participants.some(p => p.usuarioId === user.id);

  // --- ESTADOS PARA CONTROLAR LOS MODALES ---
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);

  // --- EFECTOS PARA CARGAR DATOS Y ESCUCHAR MENSAJES DE LA APP NATIVA ---
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

  // --- LÓGICA DE UI (COMPARTIR Y MODALES) ---
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

  // --- LÓGICA PARA UNIRSE AL EVENTO ---
  const handleJoinClick = useCallback(() => {
    if (!user) {
      setIsAuthModalVisible(true);
      return;
    }
    setIsJoinModalVisible(true);
  }, [user]);

  // --- LÓGICA PARA CUANDO EL USUARIO SE CONFIRMA EN EL MODAL DE UNIRSE ---
  const handleConfirmJoin = useCallback(async (nickEnEvento: string, rolElegido: string) => {
    setIsJoinModalVisible(false);
    try {
      await handleJoinEvent(user, nickEnEvento, rolElegido);
      addNotification('¡Te has unido al evento con éxito!', 'success');
    } catch (err) {
      addNotification('No pudiste unirte al evento. Inténtalo de nuevo.', 'error');
    }
  }, [user, handleJoinEvent, addNotification]);

  // --- LÓGICA PARA ABANDONAR EL EVENTO ---
  const handleLeaveClick = useCallback(async () => {
    if (!user) return;
    try {
      await handleLeaveEvent(user);
      addNotification('Has abandonado el evento.', 'info');
    } catch (err) {
      addNotification('No pudiste abandonar el evento. Inténtalo de nuevo.', 'error');
    }
  }, [user, handleLeaveEvent, addNotification]);

  // --- LÓGICA PARA EL LOGIN EXITOSO ---
  const handleLoginSuccess = useCallback(() => {
    setIsAuthModalVisible(false);
    setIsJoinModalVisible(true); // Mostramos el modal para unirse
  }, []);

  // --- RENDERIZADO CONDICIONAL ---
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
      <MockLogin />
 {/* 3. AVISO DE MODO OFFLINE (NO BLOQUEANTE) */}
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
      <RulesSection />

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