// src/components/ParticipantsSection.tsx
import React from 'react';
import type { EventParticipant } from '../types';

interface ParticipantsSectionProps {
  participants: EventParticipant[];
}

const ParticipantsSection: React.FC<ParticipantsSectionProps> = ({ participants }) => {
  if (!participants || participants.length === 0) {
    return (
      <section className="section">
        <h3>EQUIPOS</h3>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          Todavía no hay participantes. ¡Sé el primero en unirte!
        </p>
      </section>
    );
  }

  return (
    <section className="section">
      <h3>EQUIPOS</h3>
      <ul className="participant-list">
        {participants.map((participant) => (
          <li key={participant.id} className="participant-item">
            {/* --- CAMBIO 1: Usamos el nick del evento para el avatar --- */}
            <div className="participant-avatar">{participant.nickEnEvento?.charAt(0) || 'T'}</div>
            <div>
              {/* --- CAMBIO 2: Mostramos el nick del evento como nombre principal --- */}
              <strong>{participant.nickEnEvento}</strong>
              
              {/* --- CAMBIO 3: Mostramos el nombre de usuario como información secundaria --- */}
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                Usuario: {participant.usuarioUsername}
              </p>

              {/* --- CAMBIO 4: Mostramos el rol elegido --- */}
              <p style={{ margin: 0, fontSize: '0.8em', color: 'var(--accent-yellow)' }}>
                Rol: {participant.rolElegido}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ParticipantsSection;