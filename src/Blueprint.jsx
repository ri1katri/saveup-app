import React from 'react';

const Blueprint = ({ mainSaved, microSaved, totalPrice }) => {
  if (!totalPrice) return null;

  // Считаем проценты
  const mainPercent = Math.min((mainSaved / totalPrice) * 100, 100);
  const microPercent = Math.min((microSaved / totalPrice) * 100, 100 - mainPercent);

  // В нашей 3D проекции пол находится между координатами Y=80 (дальний угол) и Y=180 (ближний угол).
  // Значит, полная высота заполнения = 100 единиц.
  const mainHeight = mainPercent; 
  const microHeight = microPercent;

  // Маска ползет снизу вверх (от ближнего угла к дальнему)
  const mainY = 180 - mainHeight;
  const microY = mainY - microHeight;

  return (
    <div className="blueprint-wrapper">
      <svg viewBox="0 0 200 200" className="blueprint-svg">
        <defs>
          {/* Градиент для основных сбережений (Неоновый оранжевый) */}
          <linearGradient id="main-glow" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF5E00" />
            <stop offset="100%" stopColor="#FFAE00" />
          </linearGradient>

          {/* Текстура для Копейки (Золотые вкрапления) */}
          <pattern id="kopeika-stars" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="4" r="1.5" fill="#FFE259" opacity="0.8" />
            <circle cx="14" cy="12" r="1" fill="#FFA751" opacity="0.9" />
            <circle cx="8" cy="18" r="2" fill="#FFFFFF" opacity="0.5" />
          </pattern>

          {/* Шторка заполнения для основы */}
          <clipPath id="main-fill-clip">
            <rect x="0" y={mainY} width="200" height={mainHeight} style={{ transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
          </clipPath>

          {/* Шторка заполнения для микро-копейки */}
          <clipPath id="micro-fill-clip">
            <rect x="0" y={microY} width="200" height={microHeight} style={{ transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
          </clipPath>
        </defs>

        {/* --- КАРКАС КВАРТИРЫ (Пустое пространство) --- */}
        {/* Левая стена */}
        <path d="M 20 130 L 100 80 L 100 20 L 20 70 Z" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        {/* Правая стена */}
        <path d="M 180 130 L 100 80 L 100 20 L 180 70 Z" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        {/* Пол (Сетка) */}
        <path id="floor" d="M 100 180 L 20 130 L 100 80 L 180 130 Z" fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

        {/* --- ЗАЛИВКА ТЕРРИТОРИИ --- */}
        {/* Применяем маску только к полу, чтобы он закрашивался от входа к задней стене */}
        <use href="#floor" fill="url(#main-glow)" clipPath="url(#main-fill-clip)" opacity="0.8" />
        <use href="#floor" fill="url(#kopeika-stars)" clipPath="url(#micro-fill-clip)" />
        
        {/* Легкая неоновая подсветка по краям заполненной зоны */}
        <use href="#floor" fill="none" stroke="#FF5E00" strokeWidth="2" clipPath="url(#main-fill-clip)" opacity="0.5" style={{ filter: 'blur(2px)' }} />
      </svg>
    </div>
  );
};

export default Blueprint;
