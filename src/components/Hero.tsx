// src/components/Hero.tsx
import React from 'react';

interface HeroProps {
  title: string;
  status: string;
}

const Hero: React.FC<HeroProps> = ({ title, status }) => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="event-title">{title}</h1>
        <span className="event-status">{status}</span>
      </div>
    </section>
  );
};

export default Hero;