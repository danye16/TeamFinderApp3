// src/components/InfoCards.tsx
import React from 'react';

interface InfoCardProps {
  icon: string;
  label: string;
  value: string | React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, label, value }) => {
  return (
    <div className="info-card">
      <p>{icon} {label}</p>
      <span>{value}</span>
    </div>
  );
};

interface InfoCardsProps {
  cardsData: InfoCardProps[];
}

const InfoCards: React.FC<InfoCardsProps> = ({ cardsData }) => {
  return (
    <section className="info-cards">
      {cardsData.map((card, index) => (
        <InfoCard key={index} icon={card.icon} label={card.label} value={card.value} />
      ))}
    </section>
  );
};

export default InfoCards;