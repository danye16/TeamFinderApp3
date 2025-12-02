// src/components/JoinEventModal.tsx
import React, { useRef } from 'react';

interface JoinEventModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (nickEnEvento: string, rolElegido: string) => void;
}

const JoinEventModal: React.FC<JoinEventModalProps> = ({ isVisible, onClose, onConfirm }) => {
  const nickInputRef = useRef<HTMLInputElement>(null);
  const roleInputRef = useRef<HTMLInputElement>(null);

   const handleConfirmClick = () => {
    const nick = nickInputRef.current?.value;
    const role = roleInputRef.current?.value;

    if (!nick || !role) {
      return; // <-- Simplemente no hacemos nada si no hay datos
    }

    onConfirm(nick, role);
  };

  if (!isVisible) return null;

  return (
    <div className="modal" style={{ display: 'flex' }}>
      <div className="modal-content">
        <button className="close-modal" onClick={onClose}>&times;</button>
        <h2>¡PREPARATE PARA LA BATALLA!</h2>
        <p>Confirma tus datos para unirte al evento.</p>
        
        <form onSubmit={(e) => { e.preventDefault(); handleConfirmClick(); }}>
          <div className="form-group">
            <label htmlFor="nickEnEvento">NICK EN EL EVENTO</label>
            <input 
              type="text" 
              id="nickEnEvento" 
              ref={nickInputRef}
              placeholder="Ej: ElProPlayer123"
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="rolElegido">ROL ELEGIDO</label>
            <input 
              type="text" 
              id="rolElegido" 
              ref={roleInputRef}
              placeholder="Ej: Tanque, Daño, Soporte"
              required 
            />
          </div>
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
            <button type="button" className="cta-button join" onClick={handleConfirmClick}>
              ¡UNIRSE!
            </button>
            <button type="button" className="cta-button leave" onClick={onClose} style={{ padding: '15px 25px' }}>
              CANCELAR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinEventModal;