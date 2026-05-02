import React from 'react';

const Blueprint = ({ mainSaved, microSaved, totalPrice }) => {
  if (!totalPrice) return null;

  const mainPercent = Math.min((mainSaved / totalPrice) * 100, 100);
  const microPercent = Math.min((microSaved / totalPrice) * 100, 100 - mainPercent);

  // В этой новой проекции пол вытянут от Y=40 (дальний угол) до Y=190 (ближний угол)
  const floorHeight = 150; 
  const mainHeight = (mainPercent / 100) * floorHeight;
  const microHeight = (microPercent / 100) * floorHeight;

  const mainY = 190 - mainHeight;
  const microY = mainY - microHeight;

  return (
    <div className="blueprint-wrapper">
      <svg viewBox="0 0 240 240" className="blueprint-svg">
        <defs>
          <linearGradient id="main-glow" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF5E00" />
            <stop offset="100%" stopColor="#FFAE00" />
          </linearGradient>

          <pattern id="kopeika-stars" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="4" r="1.5" fill="#FFE259" opacity="0.8" />
            <circle cx="14" cy="12" r="1" fill="#FFA751" opacity="0.9" />
            <circle cx="8" cy="18" r="2" fill="#FFFFFF" opacity="0.5" />
          </pattern>

          <clipPath id="main-fill-clip">
            <rect x="0" y={mainY} width="240" height={mainHeight} style={{ transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
          </clipPath>

          <clipPath id="micro-fill-clip">
            <rect x="0" y={microY} width="240" height={microHeight} style={{ transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
          </clipPath>
        </defs>

        {/* --- ПОЛ (Основная площадь) --- */}
        {/* Форма вытянутого прямоугольника в изометрии */}
        <path id="floor-area" d="M 120 190 L 40 140 L 120 40 L 200 90 Z" fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

        {/* --- ЗАЛИВКА ТЕРРИТОРИИ --- */}
        <use href="#floor-area" fill="url(#main-glow)" clipPath="url(#main-fill-clip)" opacity="0.85" />
        <use href="#floor-area" fill="url(#kopeika-stars)" clipPath="url(#micro-fill-clip)" />
        <use href="#floor-area" fill="none" stroke="#FF5E00" strokeWidth="2" clipPath="url(#main-fill-clip)" opacity="0.6" style={{ filter: 'blur(3px)' }} />

        {/* --- КАРКАС И СТЕНЫ --- */}
        {/* Левая внешняя стена (с окнами) */}
        <path d="M 40 140 L 120 40 L 120 10 L 40 110 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        {/* Вырезы под окна на левой стене (прозрачные) */}
        <path d="M 60 115 L 80 90 L 80 50 L 60 75 Z" fill="#0B0B0F" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
        <path d="M 90 78 L 110 53 L 110 23 L 90 48 Z" fill="#0B0B0F" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />

        {/* Правая внешняя стена */}
        <path d="M 200 90 L 120 40 L 120 10 L 200 60 Z" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

        {/* Внутренняя перегородка (Санузел) - отсекает верхний правый угол */}
        <path d="M 120 90 L 160 65 L 160 35 L 120 60 Z" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <path d="M 120 90 L 140 115 L 140 85 L 120 60 Z" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

        {/* Дверной проем (Вход внизу слева) */}
        <path d="M 100 177 L 115 186 L 115 156 L 100 147 Z" fill="#0B0B0F" stroke="none" />
      </svg>
    </div>
  );
};

export default Blueprint;
