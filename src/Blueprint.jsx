import React from 'react';

// Теперь мы передаем totalPrice как свойство (props)
const Blueprint = ({ mainSaved, microSaved, totalPrice }) => {
  if (!totalPrice) return null;

  const mainPercent = Math.min((mainSaved / totalPrice) * 100, 100);
  const microPercent = Math.min((microSaved / totalPrice) * 100, 100 - mainPercent);

  const mainY = 100 - mainPercent;
  const microY = mainY - microPercent;

  return (
    <div className="blueprint-container">
      <svg viewBox="0 0 100 100" className="blueprint-svg">
        <defs>
          <pattern id="kopeika-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
            <rect width="10" height="10" fill="#f4f0ec" /> 
            <circle cx="2" cy="2" r="1.5" fill="#e0a96d" />
            <circle cx="7" cy="8" r="1" fill="#ddc3a5" />
            <circle cx="8" cy="3" r="0.5" fill="#201e20" />
          </pattern>
          <path id="apartment-shape" d="M 10 10 L 90 10 L 90 45 L 55 45 L 55 90 L 10 90 Z" />
          <clipPath id="main-fill-clip">
            <rect x="0" y={mainY} width="100" height={mainPercent} style={{ transition: 'all 1s ease-in-out' }} />
          </clipPath>
          <clipPath id="micro-fill-clip">
            <rect x="0" y={microY} width="100" height={microPercent} style={{ transition: 'all 1s ease-in-out' }} />
          </clipPath>
        </defs>

        <use href="#apartment-shape" fill="none" stroke="#d3d3d3" strokeWidth="1" />
        <use href="#apartment-shape" fill="#8FBC8F" clipPath="url(#main-fill-clip)" />
        <use href="#apartment-shape" fill="url(#kopeika-pattern)" clipPath="url(#micro-fill-clip)" />
      </svg>
    </div>
  );
};

export default Blueprint;
