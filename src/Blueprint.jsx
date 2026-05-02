import React from 'react';

const Blueprint = ({ mainSaved, microSaved, totalPrice }) => {
  const safePrice = Number(totalPrice) || 1; 
  const safeMain = Number(mainSaved) || 0;
  const safeMicro = Number(microSaved) || 0;

  let mainPercent = (safeMain / safePrice) * 100;
  let microPercent = (safeMicro / safePrice) * 100;

  if (isNaN(mainPercent) || !isFinite(mainPercent)) mainPercent = 0;
  if (isNaN(microPercent) || !isFinite(microPercent)) microPercent = 0;

  if (mainPercent > 100) {
    mainPercent = 100;
    microPercent = 0;
  } else if (mainPercent + microPercent > 100) {
    microPercent = 100 - mainPercent;
  }

  const TOTAL_HEIGHT = 210; 
  const mainHeight = (mainPercent / 100) * TOTAL_HEIGHT;
  const microHeight = (microPercent / 100) * TOTAL_HEIGHT;

  const mainY = 220 - mainHeight;
  const microY = mainY - microHeight;

  // Выносим координаты в переменные, чтобы не дублировать код и избежать бага iOS
  const floorPath = "M 120 220 L 40 170 L 120 70 L 200 120 Z";
  const leftWallPath = "M 40 170 L 120 70 L 120 10 L 40 110 Z";
  const rightWallPath = "M 200 120 L 120 70 L 120 10 L 200 60 Z";

  return (
    <div className="blueprint-wrapper">
      <svg viewBox="0 0 240 240" className="blueprint-svg">
        <defs>
          <linearGradient id="main-glow" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF5E00" />
            <stop offset="100%" stopColor="#FFAE00" />
          </linearGradient>

          <pattern id="kopeika-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
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

        {/* 1. БАЗОВЫЙ ЧЕРТЕЖ */}
        <g>
          <path d={floorPath} fill="#1C1C24" stroke="#333344" strokeWidth="1" />
          <path d={leftWallPath} fill="#252530" stroke="#333344" strokeWidth="1" />
          <path d={rightWallPath} fill="#20202A" stroke="#333344" strokeWidth="1" />
          
          {/* Окна */}
          <path d="M 55 145 L 75 120 L 75 80 L 55 105 Z" fill="#0B0B0F" stroke="#333344" strokeWidth="0.5" />
          <path d="M 85 107 L 105 82 L 105 42 L 85 67 Z" fill="#0B0B0F" stroke="#333344" strokeWidth="0.5" />
        </g>

        {/* 2. ЗАЛИВКА ОСНОВНОГО ПРОГРЕССА (Без айфоновских багов!) */}
        <g clipPath="url(#main-fill-clip)">
          <path d={floorPath} fill="url(#main-glow)" opacity="0.4" />
          <path d={floorPath} fill="none" stroke="#FF7A00" strokeWidth="2" opacity="0.8" />
          
          <path d={leftWallPath} fill="#FF7A00" opacity="0.15" />
          <path d={rightWallPath} fill="#FFB300" opacity="0.15" />
          
          <path d={leftWallPath} fill="none" stroke="#FF7A00" strokeWidth="1.5" opacity="0.6" />
          <path d={rightWallPath} fill="none" stroke="#FFB300" strokeWidth="1.5" opacity="0.6" />
        </g>

        {/* 3. ЗАЛИВКА КОПЕЙКИ */}
        <g clipPath="url(#micro-fill-clip)">
          <path d={floorPath} fill="url(#kopeika-pattern)" opacity="0.8" />
          <path d={leftWallPath} fill="#FFE259" opacity="0.2" />
          <path d={rightWallPath} fill="#FFE259" opacity="0.2" />
          
          <path d={floorPath} fill="none" stroke="#FFE259" strokeWidth="1.5" opacity="0.8" />
          <path d={leftWallPath} fill="none" stroke="#FFE259" strokeWidth="1" opacity="0.6" />
          <path d={rightWallPath} fill="none" stroke="#FFE259" strokeWidth="1" opacity="0.6" />
        </g>

        {/* Дверь */}
        <path d="M 100 200 L 115 185 L 115 155 L 100 170 Z" fill="#0B0B0F" stroke="none" />
      </svg>
    </div>
  );
};

export default Blueprint;