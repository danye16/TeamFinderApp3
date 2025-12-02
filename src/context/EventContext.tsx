// src/context/EventContext.tsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import type { Event, EventParticipant, User } from '../types';
import type { ReactNode } from 'react';
import { getEventById, getParticipants, joinEvent, leaveEvent } from '../services/apiService';
import { useNotification } from './NotificationContext';
interface EventContextType {
  event: Event | null;
  participants: EventParticipant[];
  loading: boolean;
  error: string | null;
  isOffline: boolean;
  loadEventData: (eventId: string) => Promise<void>;
  handleJoinEvent: (user: User, nickEnEvento: string, rolElegido: string) => Promise<void>;
  handleLeaveEvent: (user: User) => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotification();
  // Iniciamos comprobando si el navegador ya sabe que no tiene red
  const [isOffline, setIsOffline] = useState(!navigator.onLine);


  useEffect(() => {
    // Solo ejecutamos esto si estamos offline al momento de cargar (F5).
    if (!navigator.onLine) {
      const lastId = localStorage.getItem('last_viewed_event_id');
      if (lastId) {
        console.log(`📦 Fallback: Intentando cargar el último evento visto (${lastId}) desde la caché.`);

        // Usamos la función de caché directamente.
        const cacheKey = `event_${lastId}`;

        // Intentamos cargar desde la caché antes de que EventPage le pida los datos.
        // Esto ayuda a que el evento aparezca inmediatamente.
        loadFromCache(cacheKey);

        // Marcamos que ya terminamos de cargar (aunque sea de caché)
        setLoading(false);
        setIsOffline(true);
      } else {
        // Si no hay ID guardado, ya terminamos de intentar cargar.
        setLoading(false);
        setIsOffline(true);
      }
    }

    // Listeners para cambios de red
    const handleStatusChange = () => {
      const online = navigator.onLine;
      setIsOffline(!online);
      if (online) {
        // Si vuelve el internet, intentamos sincronizar
        addNotification('Conexión recuperada. Intentando enviar datos pendientes...', 'info');
        syncPendingActions();
      } else {
        addNotification('Sin conexión. Trabajando en modo offline.', 'info');
      }
    };

    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);

    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    }
  }, []); // 🚨 Se ejecuta solo al montar.
  // --- LOGICA DE CACHÉ ---
  const loadFromCache = (cacheKey: string) => {
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      const { event: cachedEvent, participants: cachedParticipants } = JSON.parse(cachedData);
      setEvent(cachedEvent);
      setParticipants(cachedParticipants);
      console.log('📦 Datos cargados desde caché local.');
    }
  };

  const loadEventData = useCallback(async (eventId: string) => {
    setLoading(true);
    // IMPORTANTE: No reseteamos error a null aquí para no flashear, lo manejamos abajo.
    const cacheKey = `event_${eventId}`;

    if (navigator.onLine) {
      try {
        const eventData = await getEventById(eventId);
        const participantsData = await getParticipants(eventId);

        setEvent(eventData);
        setParticipants(participantsData);
        setError(null); // Limpiamos errores si la carga fue exitosa

        // Guardar en caché fresca
        localStorage.setItem(cacheKey, JSON.stringify({ event: eventData, participants: participantsData }));
      } catch (err) {
        console.error('Fallo de red al cargar evento:', err);
        // Si falla la red, intentamos caché pero NO bloqueamos la UI con un setError fatal
        loadFromCache(cacheKey);
        setIsOffline(true);
      }
    } else {
      console.log('Modo Offline detectado al cargar.');
      loadFromCache(cacheKey);
      setIsOffline(true);
    }
    setLoading(false);
  }, []);

  // --- SINCRONIZACIÓN INTELIGENTE ---
  // const syncPendingActions = useCallback(async () => {
  //   const pendingActions = JSON.parse(localStorage.getItem('pendingActions') || '[]');
  //   if (pendingActions.length === 0) return;

  //   console.log(`🌐 Internet volvió. Intentando sincronizar ${pendingActions.length} acciones...`);

  //   // Usamos un nuevo array para guardar SOLO las que fallen por error de RED (no de lógica)
  //   const failedActions = [];

  //   for (const action of pendingActions) {
  //     try {
  //       if (action.type === 'JOIN_EVENT') {
  //           await joinEvent(action.payload);
  //           console.log("✅ Sincronización exitosa: Unirse al evento");
  //       } else if (action.type === 'LEAVE_EVENT') {
  //            await leaveEvent(action.payload.eventoId.toString(), action.payload.usuarioId.toString());
  //            console.log("✅ Sincronización exitosa: Salir del evento");
  //       }
  //     } catch (err: any) {
  //       // --- AQUÍ ESTÁ LA SOLUCIÓN AL ERROR 400 ---
  //       const errorMessage = err.message || JSON.stringify(err);

  //       // Si el error es 400 (Bad Request) o dice "ya estás inscrito", 
  //       // NO lo agregamos a failedActions. Lo descartamos porque ya no se puede procesar.
  //       if (errorMessage.includes("400") || errorMessage.includes("inscrito") || errorMessage.includes("Bad Request")) {
  //          console.warn("⚠️ Acción descartada (Servidor la rechazó o ya estaba hecha):", errorMessage);
  //       } else {
  //          // Si es otro error (ej: timeout, error 500, sin red), la guardamos para intentar luego
  //          console.error("❌ Error de red/servidor, se reintentará luego:", errorMessage);
  //          failedActions.push(action);
  //       }
  //     }
  //   }

  //   localStorage.setItem('pendingActions', JSON.stringify(failedActions));

  //   // Si logramos vaciar la cola, recargamos los datos para ver la info actualizada
  //   if (failedActions.length === 0 && event) {
  //       loadEventData(event.id.toString());
  //   }
  // }, [event, loadEventData]);

  const syncPendingActions = useCallback(async () => {
    const pendingActions = JSON.parse(localStorage.getItem('pendingActions') || '[]');
    if (pendingActions.length === 0) return;

    console.log(`🌐 Sincronizando ${pendingActions.length} acciones pendientes...`);
    const failedActions = [];
    let successCount = 0;

    for (const action of pendingActions) {
      try {
        if (action.type === 'JOIN_EVENT') {
          await joinEvent(action.payload);
          successCount++;
        } else if (action.type === 'LEAVE_EVENT') {
          await leaveEvent(action.payload.eventoId.toString(), action.payload.usuarioId.toString());
          successCount++;
        }
      } catch (err: any) {
        const msg = err.message || JSON.stringify(err);
        if (msg.includes("400") || msg.includes("401") || msg.includes("inscrito")) {
          console.warn("⚠️ Acción descartada por lógica:", msg);
        } else {
          failedActions.push(action);
        }
      }
    }

    localStorage.setItem('pendingActions', JSON.stringify(failedActions));

    // Si hubo éxito, avisamos al usuario
    if (successCount > 0) {
      addNotification(`✅ Datos enviados: Se han sincronizado ${successCount} acciones.`, 'success');
      if (event) loadEventData(event.id.toString());
    }
  }, [event, loadEventData, addNotification]);



  // --- LISTENERS DE RED ---
  // useEffect(() => {
  //   const handleOnline = () => {
  //     console.log('📶 Conexión restablecida');
  //     setIsOffline(false);
  //     // NO usamos setError(null) aquí para no borrar errores legítimos de API
  //     syncPendingActions();
  //   };

  //   const handleOffline = () => {
  //     console.log('📴 Conexión perdida');
  //     setIsOffline(true);
  //     // ¡IMPORTANTE!: NO usamos setError() aquí. 
  //     // Si pones setError('Offline'), tu EventPage hace return <Error.../> y pone la pantalla negra.
  //   };

  //   window.addEventListener('online', handleOnline);
  //   window.addEventListener('offline', handleOffline);

  //   return () => {
  //     window.removeEventListener('online', handleOnline);
  //     window.removeEventListener('offline', handleOffline);
  //   };
  // }, [syncPendingActions]);





  // --- MANEJO DE UNIRSE AL EVENTO (MEJORADO) ---
  //  const handleJoinEvent = useCallback(async (user: User, nickEnEvento: string, rolElegido: string) => {
  //     if (!event) return;

  //     // Preparamos los datos según lo que pide tu Dto 'UnirseEventoDto' en el backend
  //     const actionData = { 
  //         eventoId: event.id, 
  //         usuarioId: user.id, 
  //         nickEnEvento: nickEnEvento, 
  //         rolElegido: rolElegido 
  //     };

  //     try {
  //       // Llamada real a la API
  //       await joinEvent(actionData);

  //       // Si la API responde OK, recargamos los participantes para ver el cambio
  //       await loadEventData(event.id.toString());

  //     } catch (err) {
  //       console.error("Error al unirse al evento:", err);
  //       // Relanzamos el error para que la UI (EventPage) pueda mostrar la notificación de fallo
  //       throw err;
  //     }
  //   }, [event, loadEventData]);

  const handleJoinEvent = useCallback(async (user: User, nickEnEvento: string, rolElegido: string) => {
    if (!event) return;

    const actionData = {
      eventoId: event.id,
      usuarioId: user.id,
      nickEnEvento,
      rolElegido
    };

    // Helper para guardar en cola y NOTIFICAR
    const saveToOfflineQueue = () => {
      console.log('⚠️ Sin conexión. Guardando en cola offline...');
      const pendingActions = JSON.parse(localStorage.getItem('pendingActions') || '[]');
      pendingActions.push({ type: 'JOIN_EVENT', payload: actionData });
      localStorage.setItem('pendingActions', JSON.stringify(pendingActions));

      // UI Optimista
      const fakeParticipant: EventParticipant = {
        id: Date.now(),
        eventoId: event.id,
        usuarioId: user.id,
        fechaRegistro: new Date().toISOString(),
        confirmado: false,
        usuario: user
      };
      setParticipants(prev => [...prev, fakeParticipant]);

      // AVISO AL USUARIO
      addNotification('⚠️ Sin internet: Datos guardados. Se enviarán al recuperar la conexión.', 'info');
    };

    if (!navigator.onLine || isOffline) {
      saveToOfflineQueue();
      return;
    }

    try {
      await joinEvent(actionData);
      addNotification('¡Te has unido al evento con éxito!', 'success');
      await loadEventData(event.id.toString());
    } catch (err: any) {
      const errorMsg = err.message || "";
      if (errorMsg.includes("400") || errorMsg.includes("401") || errorMsg.includes("inscrito")) {
        throw err; // Mostramos error real si la API rechaza los datos
      }
      // Si es fallo de red, guardamos
      console.error("Fallo de red al unirse, pasando a modo offline:", err);
      saveToOfflineQueue();
    }
  }, [event, isOffline, loadEventData, addNotification]);

  // --- FUNCIÓN PARA SALIR ---
  // const handleLeaveEvent = useCallback(async (user: User) => {
  //   if (!event) return;
  //   try {
  //     await leaveEvent(event.id.toString(), user.id.toString());
  //     await loadEventData(event.id.toString());
  //   } catch (err) {
  //     console.error("Error al abandonar el evento:", err);
  //     throw err;
  //   }
  // }, [event, loadEventData]);


  const handleLeaveEvent = useCallback(async (user: User) => {
    if (!event) return;

    if (!navigator.onLine || isOffline) {
      const actionData = { eventoId: event.id, usuarioId: user.id };
      const pendingActions = JSON.parse(localStorage.getItem('pendingActions') || '[]');
      pendingActions.push({ type: 'LEAVE_EVENT', payload: actionData });
      localStorage.setItem('pendingActions', JSON.stringify(pendingActions));

      setParticipants(prev => prev.filter(p => p.usuarioId !== user.id));
      addNotification('⚠️ Sin internet: Tu salida se procesará al recuperar conexión.', 'info');
      return;
    }

    try {
      await leaveEvent(event.id.toString(), user.id.toString());
      addNotification('Has abandonado el evento.', 'success');
      loadEventData(event.id.toString());
    } catch (err) {
      throw err;
    }
  }, [event, isOffline, loadEventData, addNotification]);

  // --- MANEJO DE SALIR DEL EVENTO ---


  const value: EventContextType = {
    event,
    participants,
    loading,
    error,
    isOffline,
    loadEventData,
    handleJoinEvent,
    handleLeaveEvent,
  };

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
};

export const useEvent = (): EventContextType => {
  const context = useContext(EventContext);
  if (context === undefined) throw new Error('useEvent must be used within an EventProvider');
  return context;
};