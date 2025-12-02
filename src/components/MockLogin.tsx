// src/components/MockLogin.tsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types'; // <-- Importar el tipo User

const MockLogin: React.FC = () => {
  // 1. Cambiamos 'setUser' por 'login'
  const { user, login } = useAuth(); 

  // Datos del usuario "Daniel" que me pasaste
  const userDaniel: User = {
    id: 7,
    username: "Saika ",
    steamId: "",
    pais: "México",
    edad: 30,
    correo: null,
    avatarUrl: null,
    estiloJuego: "Aggressive (Entry)",
    fechaCreacion: "2025-12-01T03:44:41.0375978"
  };

  const handleLoginAsDaniel = () => {
    const fakeToken = 'token-falso-de-saika-para-probar';
    
    // 2. Usamos la función 'login' del contexto.
    //    Esta función espera un objeto con 'user' y 'token'.
    login({ user: userDaniel, token: fakeToken });
  };

  const handleLogout = () => {
    // También podemos usar la función 'logout' del contexto
    const { logout } = useAuth(); // La obtenemos aquí para no complicar el hook principal
    logout();
  };

  if (user) {
    return (
      <div style={{ padding: '10px', background: 'var(--bg-card)', margin: '10px', border: '2px solid var(--accent-yellow)', textAlign: 'center' }}>
        <p>Logueado como: <strong>{user.username}</strong></p>
        <button onClick={handleLogout} className="cta-button join" style={{ fontSize: '0.8em', padding: '5px 10px' }}>CERRAR SESIÓN</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '10px', background: 'var(--bg-card)', margin: '10px', border: '2px solid var(--accent-red)', textAlign: 'center' }}>
      <h4>MODO PRUEBA</h4>
      <p>Simula el login desde la app nativa:</p>
      <button onClick={handleLoginAsDaniel} className="cta-button join" style={{ fontSize: '0.8em', padding: '5px 10px' }}>LOGIN COMO Saika</button>
    </div>
  );
};

export default MockLogin;