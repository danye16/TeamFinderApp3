// src/App.tsx
import React, { useState } from 'react'; // <-- Importamos useState para manejar el modal
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// --- PROVIDERS ---
import { AuthProvider, useAuth } from './context/AuthContext'; 
import { NotificationProvider } from './context/NotificationContext';
import { EventProvider } from './context/EventContext';

// --- PÁGINAS ---
import EventPage from './pages/EventPage';
import CreateEventPage from './pages/CreateEventPage';

// --- COMPONENTES ---
import AuthModal from './components/RegistrationModal'; // <-- Importamos el modal de login/registro
import NotificationSystem from './components/NotificationSystem';

// --- ESTILOS ---
import './index.css';

// --- PÁGINA PRINCIPAL (MODIFICADA) ---
const HomePage: React.FC = () => {
  // Usamos el hook de autenticación para saber si el usuario está logueado
  const { user, logout } = useAuth(); 
  // Estado para controlar la visibilidad del modal
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);

  // Función para cerrar el modal después de un login/registro exitoso
  const handleLoginSuccess = () => {
    setIsAuthModalVisible(false);
  };

  return (
    <div>
      <h1>TeamFinder Events</h1>
      
      {/* LÓGICA DE AUTENTICACIÓN */}
      {user ? (
        // Si el usuario está logueado, mostramos su info y un botón de logout
        <div style={{ padding: '10px', background: 'var(--bg-card)', margin: '10px', border: '2px solid var(--accent-yellow)', textAlign: 'center' }}>
          <p>¡Bienvenido de nuevo, <strong>{user.username}</strong>!</p>
          <button onClick={logout} className="cta-button join" style={{ fontSize: '0.8em', padding: '5px 10px' }}>CERRAR SESIÓN</button>
        </div>
      ) : (
        // Si no está logueado, mostramos un botón para abrir el modal de autenticación
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

      {/* RENDERIZADO CONDICIONAL DEL MODAL */}
      <AuthModal 
        isVisible={isAuthModalVisible} 
        onClose={() => setIsAuthModalVisible(false)} 
        onLoginSuccess={handleLoginSuccess} 
      />
    </div>
  );
};

// --- COMPONENTE PRINCIPAL DE LA APP ---
function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
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