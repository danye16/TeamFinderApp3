// src/components/RegistrationModal.tsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { LoginDto, UsuarioCreacionDto } from '../types';

interface AuthModalProps {
  isVisible: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isVisible, onClose, onLoginSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { handleLogin, handleRegister } = useAuth();

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    if (isLoginMode) {
      const loginData: LoginDto = {
        username: formData.get('username') as string,
        password: formData.get('password') as string,
      };
      const result = await handleLogin(loginData);
      if (result.success) {
        onLoginSuccess();
      } else {
        alert(result.error);
      }
    } else {
      const registerData: UsuarioCreacionDto = {
        username: formData.get('username') as string,
        contraseña: formData.get('password') as string,
        pais: formData.get('pais') as string,
        edad: 18,
        estiloJuego: "Balanceado",
        steamId: "",
        correo: formData.get('correo') as string,
        avatarUrl: formData.get('avatarUrl') as string,
      };
      const result = await handleRegister(registerData);
      if (result.success) {
        onLoginSuccess();
      } else {
        alert(result.error);
      }
    }
    setIsLoading(false);
  };

  if (!isVisible) return null;

  return (
    <div className="modal" style={{ display: 'flex' }}>
      <div className="modal-content">
        <button className="close-modal" onClick={onClose}>&times;</button>
        <h2>{isLoginMode ? '¡INICIAR SESIÓN!' : '¡CREAR CUENTA!'}</h2>
        <p>{isLoginMode ? 'Bienvenido de vuelta.' : 'Únete a la acción.'}</p>
        
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label htmlFor="username">USERNAME</label>
            <input type="text" id="username" name="username" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">CONTRASEÑA</label>
            <input type="password" id="password" name="password" required />
          </div>
          
          {!isLoginMode && (
            <>
              <div className="form-group">
                <label htmlFor="pais">PAÍS</label>
                <input type="text" id="pais" name="pais" required />
              </div>
          {/*     <div className="form-group">
                <label htmlFor="edad">EDAD</label>
                <input type="number" id="edad" name="edad" required />
              </div>
              <div className="form-group">
                <label htmlFor="estiloJuego">ESTILO DE JUEGO</label>
                <input type="text" id="estiloJuego" name="estiloJuego" required />
              </div> */}
              {/* Opcional: steamId, correo, avatarUrl */}
            </>
          )}
          
          <button type="submit" className="cta-button join" disabled={isLoading}>
            {isLoading ? 'PROCESANDO...' : (isLoginMode ? 'INICIAR SESIÓN' : 'CREAR Y UNIRSE')}
          </button>
        </form>

        <hr style={{ borderColor: 'var(--bg-card)' }} />
        <button 
          type="button" 
          className="discord-btn" 
          onClick={() => setIsLoginMode(!isLoginMode)}
        >
          {isLoginMode ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </div>
    </div>
  );
};

export default AuthModal;