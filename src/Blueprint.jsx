import React from 'react';

const Blueprint = ({ mainSaved, microSaved, totalPrice }) => {
  // Защита от деления на 0
  const safePrice = Number(totalPrice) || 1; 
  const safeMain = Number(mainSaved) || 0;
  const safeMicro = Number(microSaved) || 0;

  let mainPercent = (safeMain / safePrice) * 100;
  let microPercent = (safeMicro / safePrice) * 100;

  // Блокируем любые NaN или Бесконечности
  if (isNaN(mainPercent) || !isFinite(mainPercent)) mainPercent = 0;
  if (isNaN(microPercent) || !isFinite(microPercent)) microPercent = 0;

  mainPercent = Math.min(mainPercent, 100);
  microPercent = Math.min(microPercent, 100 - mainPercent);

  const floorHeight = 150; 
  const mainHeight = (mainPercent / 100) * floorHeight;
  const microHeight = (microPercent / 100) * floorHeight;

  // Даже если случится чудо, переменные Y никогда не будут пустыми
  const mainY = 190 - (mainHeight || 0);
  const microY = mainY - (microHeight || 0);

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
            <rect x="0" y={mainY} width="240" height={mainHeight || 0} style={{ transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
          </clipPath>

          <clipPath id="micro-fill-clip">
            <rect x="0" y={microY} width="240" height={microHeight || 0} style={{ transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
          </clipPath>
        </defs>

        <g opacity="0.3">
          <path d="M 120 190 L 40 140 L 120 40 L 200 90 Z" fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <path d="M 40 140 L 120 40 L 120 10 L 40 110 Z" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <path d="M 200 90 L 120 40 L 120 10 L 200 60 Z" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <path d="M 120 90 L 160 65 L 160 35 L 120 60 Z" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        </g>

        <g clipPath="url(#main-fill-clip)">
          <path d="M 120 190 L 40 140 L 120 40 L 200 90 Z" fill="url(#main-glow)" opacity="0.85" />
          <path d="M 40 140 L 120 40 L 120 10 L 40 110 Z" fill="rgba(255, 94, 0, 0.3)" stroke="#FF5E00" strokeWidth="1" />
          <path d="M 200 90 L 120 40 L 120 10 L 200 60 Z" fill="rgba(255, 94, 0, 0.15)" stroke="#FF5E00" strokeWidth="1" />
          <path d="M 120 90 L 160 65 L 160 35 L 120 60 Z" fill="rgba(255, 94, 0, 0.2)" stroke="#FF5E00" strokeWidth="1" />
        </g>

        <g clipPath="url(#micro-fill-clip)">
          <path d="M 120 190 L 40 140 L 120 40 L 200 90 Z" fill="url(#kopeika-stars)" />
          <path d="M 40 140 L 120 40 L 120 10 L 40 110 Z" fill="rgba(255, 226, 89, 0.3)" stroke="#FFE259" strokeWidth="1" />
          <path d="M 200 90 L 120 40 L 120 10 L 200 60 Z" fill="rgba(255, 226, 89, 0.15)" stroke="#FFE259" strokeWidth="1" />
          <path d="M 120 90 L 160 65 L 160 35 L 120 60 Z" fill="rgba(255, 226, 89, 0.2)" stroke="#FFE259" strokeWidth="1" />
        </g>

        <path d="M 100 177 L 115 186 L 115 156 L 100 147 Z" fill="#0B0B0F" stroke="none" />
      </svg>
    </div>
  );
};

export default Blueprint;
