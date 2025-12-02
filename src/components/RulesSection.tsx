// src/components/RulesSection.tsx
import React, { useState } from 'react';

const RulesSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

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
          <p><strong>Formato:</strong> Eliminación directa, Best of 3.</p>
          <p><strong>Requisitos:</strong> Rango Oro o superior.</p>
          <p><strong>Reglas:</strong> Prohibido el uso de bugs o glitches. Cualquier falta de respeto será sancionada.</p>
        </div>
      )}
    </section>
  );
};

export default RulesSection;