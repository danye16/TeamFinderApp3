// VERSIÓN TEMPORAL PARA DEBUGGEO
import React, { useState } from 'react';

interface RulesSectionProps {
  descripcion: string;
}

const RulesSection: React.FC<RulesSectionProps> = ({ descripcion }) => {
  const [isVisible, setIsVisible] = useState(false);

  // --- AÑADE ESTA LÍNEA PARA VER QUÉ ESTÁ RECIBIENDO ---
  console.log("RulesSection recibió esta descripción:", descripcion);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <section className="section">
      <h3>REGLAS</h3>
      <button className="toggle-rules" onClick={toggleVisibility}>
        {isVisible ? '▲ OCULTAR REGLAS Y FORMATO' : '▼ VER REGLAS Y FORMATO'}
      </button>
      {isVisible && (
        <div className="rules-content">
          <p>{descripcion}</p>
        </div>
      )}
    </section>
  );
};

export default RulesSection;