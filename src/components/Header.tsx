// src/components/Header.tsx
import React from 'react';

interface HeaderProps {
  onShare: () => void;
}

const Header: React.FC<HeaderProps> = ({ onShare }) => {
  return (
    <header>
      <div className="logo">TEAMFINDER</div>
      <button className="share-btn" onClick={onShare}>COMPARTIR</button>
    </header>
  );
};

export default Header;