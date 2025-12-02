import React from 'react';

interface CtaButtonProps {
  title: string;
  onClick: () => void;
  isJoined?: boolean;
}

const CtaButton: React.FC<CtaButtonProps> = ({ title, onClick, isJoined }) => {
  const buttonClass = isJoined ? 'cta-button joined' : 'cta-button join';
  return (
    <div className="cta-container">
      <button className={buttonClass} onClick={onClick}>
        {title}
      </button>
    </div>
  );
};

export default CtaButton;