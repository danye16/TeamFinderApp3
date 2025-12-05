// src/App.tsx
import React, { useState, useEffect } from 'react'; // <--- CORRECCIÓN 1: Agregamos useEffect
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'; // <--- CORRECCIÓN 2: Agregamos useNavigate

// --- PROVIDERS ---
import { AuthProvider, useAuth } from './context/AuthContext'; 
import { NotificationProvider } from './context/NotificationContext';
import { EventProvider } from './context/EventContext';

// --- PÁGINAS ---
import EventPage from './pages/EventPage';
import CreateEventPage from './pages/CreateEventPage';

// --- COMPONENTES ---
import AuthModal from './components/RegistrationModal'; 
import NotificationSystem from './components/NotificationSystem';

// --- ESTILOS ---
import './index.css';

// --- PÁGINA PRINCIPAL ---
const HomePage: React.FC = () => {
  const { user, logout } = useAuth(); 
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);

  const handleLoginSuccess = () => {
    setIsAuthModalVisible(false);
  };

  return (
    <div>
      <h1>TeamFinder Events</h1>
      
      {user ? (
        <div style={{ padding: '10px', background: 'var(--bg-card)', margin: '10px', border: '2px solid var(--accent-yellow)', textAlign: 'center' }}>
          <p>¡Bienvenido de nuevo, <strong>{user.username}</strong>!</p>
          <button onClick={logout} className="cta-button join" style={{ fontSize: '0.8em', padding: '5px 10px' }}>CERRAR SESIÓN</button>
        </div>
      ) : (
        <div style={{ textAlign: 'center', margin: '20px' }}>
          <button 
            onClick={() => setIsAuthModalVisible(true)} 
            className="cta-button join"
          >
            INICIAR SESIÓN / REGISTRARSE
          </button>
        </div>
      )}

      <p>Usa un enlace para unirte a un evento o <a href="/crear-evento">crea un nuevo evento</a>.</p>

      <AuthModal 
        isVisible={isAuthModalVisible} 
        onClose={() => setIsAuthModalVisible(false)} 
        onLoginSuccess={handleLoginSuccess} 
      />
    </div>
  );
};

// --- COMPONENTE REDIRECTOR ---
const PWARedirect: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Detectar si es PWA (Modo instalado)
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                  (window.navigator as any).standalone === true;

    // 2. Verificar si ya estamos en el evento 4
    const isAlreadyThere = window.location.pathname.includes('/evento/4');

    // 3. Lógica: Si soy App y NO estoy en el evento 4 -> Mandame para allá.
    if (isPWA && !isAlreadyThere) {
      console.log("🚨 PWA Detectada en ruta incorrecta. Redirigiendo al Evento 4...");
      navigate('/evento/4', { replace: true });
    }
  }, [navigate]);

  return null;
};

// --- COMPONENTE PRINCIPAL DE LA APP ---
function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          {/* CORRECCIÓN 3: ¡Aquí colocamos el redirector! */}
          <PWARedirect /> 
          
          <Routes>
            <Route 
              path="/evento/:eventId" 
              element={
                <EventProvider>
                  <EventPage />
                </EventProvider>
              } 
            />
            <Route path="/crear-evento" element={<CreateEventPage />} />
            <Route path="/" element={<HomePage />} />
          </Routes>
          <NotificationSystem />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;