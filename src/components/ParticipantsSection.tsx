// src/components/ParticipantsSection.tsx
import React from 'react';
import type { EventParticipant } from '../types'; // <-- CORRECCIÓN AQUÍ

interface ParticipantsSectionProps {
  participants: EventParticipant[];
}

const ParticipantsSection: React.FC<ParticipantsSectionProps> = ({ participants }) => {
  return (
    <section className="section">
      <h3>EQUIPOS</h3>
      <ul className="participant-list">
        {participants.map((participant) => (
          <li key={participant.id} className="participant-item">
            <div className="participant-avatar">{participant.usuario?.gamertag?.charAt(0) || 'T'}</div>
            <div>
              <strong>{participant.usuario?.gamertag || 'Cargando...'}</strong>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                {participant.confirmado ? 'Confirmado' : 'Pendiente de confirmación'}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ParticipantsSection;