// src/components/Hero.tsx
import React from 'react';

// --- CAMBIO 1: Añadimos la prop para la imagen de fondo ---
interface HeroProps {
  title: string;
  status: string;
  backgroundImage?: string; // El '?' la hace opcional
}

const Hero: React.FC<HeroProps> = ({ title, status, backgroundImage }) => {
  // --- CAMBIO 2: Creamos un estilo dinámico para el fondo ---
  const heroStyle: React.CSSProperties = {
    // Si hay una imagen, la usamos. Si no, usamos la imagen por defecto.
    backgroundImage: `url(${backgroundImage || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSStWID6D0Fqz_tzdYk9YYUQQTl08WXi2l7Xg&s'})`,
  };

  return (
    // --- CAMBIO 3: Aplicamos el estilo dinámico ---
    <section className="hero" style={heroStyle}>
      <div className="hero-content">
        <h1 className="event-title">{title}</h1>
        <span className="event-status">{status}</span>
      </div>
    </section>
  );
};

export default Hero;