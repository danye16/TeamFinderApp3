// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// --- PROVIDERS (EL CEREBRO DE LA APP) ---
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { EventProvider } from './context/EventContext';
// --- PÁGINAS ---
import EventPage from './pages/EventPage';
import CreateEventPage from './pages/CreateEventPage';

// --- COMPONENTES ---
import MockLogin from './components/MockLogin'; // Solo para desarrollo
import NotificationSystem from './components/NotificationSystem'; // El sistema de notificaciones

// --- ESTILOS ---
import './index.css';

// --- PÁGINA PRINCIPAL ---
const HomePage: React.FC = () => (
  <div>
    <h1>TeamFinder Events</h1>
    <MockLogin /> {/* Lo mantenemos aquí para probar fácilmente */}
    <p>Usa un enlace para unirte o <a href="/crear-evento">crea un nuevo evento</a>.</p>
  </div>
);

// --- COMPONENTE PRINCIPAL DE LA APP ---
function App() {
  return (
    // 1. El proveedor de Autenticación es el más externo
    <AuthProvider>
      {/* 2. El proveedor de Notificaciones envuelve toda la app */}
      <NotificationProvider>
        <Router>
          <Routes>
            {/* 3. La página de evento necesita su propio proveedor de datos */}
            <Route 
              path="/evento/:eventId" 
              element={
                <EventProvider>
                  <EventPage />
                </EventProvider>
              } 
            />
            
            {/* 4. Las demás páginas no necesitan un proveedor especial */}
            <Route path="/crear-evento" element={<CreateEventPage />} />
            <Route path="/" element={<HomePage />} />
          </Routes>
          
          {/* 5. El sistema de notificaciones se renderiza una sola vez aquí */}
          <NotificationSystem />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;