import React from 'react';

const Blueprint = ({ mainSaved, microSaved, totalPrice }) => {
  const safePrice = Number(totalPrice) || 1; 
  const safeMain = Number(mainSaved) || 0;
  const safeMicro = Number(microSaved) || 0;

  let mainPercent = (safeMain / safePrice) * 100;
  let microPercent = (safeMicro / safePrice) * 100;

  if (isNaN(mainPercent) || !isFinite(mainPercent)) mainPercent = 0;
  if (isNaN(microPercent) || !isFinite(microPercent)) microPercent = 0;

  // ИСПРАВЛЕНИЕ БАГА №2: Строго ограничиваем рост. 
  // Если сумма больше 100%, визуально объем останавливается ровно на краях стен.
  if (mainPercent > 100) {
    mainPercent = 100;
    microPercent = 0;
  } else if (mainPercent + microPercent > 100) {
    microPercent = 100 - mainPercent;
  }

  // Максимальная высота 3D-стен = 60 единиц
  const MAX_HEIGHT = 60; 
  const h1 = (mainPercent / 100) * MAX_HEIGHT;
  const h2 = (microPercent / 100) * MAX_HEIGHT;

  return (
    <div className="blueprint-wrapper">
      <svg viewBox="0 0 240 240" className="blueprint-svg">
        <defs>
          {/* Яркий градиент для поверхности */}
          <linearGradient id="main-glow" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF7A00" />
            <stop offset="100%" stopColor="#FFB300" />
          </linearGradient>

          {/* Паттерн для Копейки */}
          <pattern id="kopeika-pattern" width="30" height="30" patternUnits="userSpaceOnUse">
            <rect width="30" height="30" fill="#FFD700" /> 
            <circle cx="6" cy="6" r="1.5" fill="#FFFFFF" opacity="0.8" />
            <circle cx="22" cy="18" r="1" fill="#FFFFFF" opacity="0.9" />
            <circle cx="12" cy="26" r="1" fill="#FFFFFF" opacity="0.5" />
          </pattern>
        </defs>

        {/* 1. ПУСТАЯ КОМНАТА (Задние стены и темный пол) */}
        <g>
          {/* Пол */}
          <path d="M 120 220 L 40 170 L 120 70 L 200 120 Z" fill="#1C1C24" stroke="#333344" strokeWidth="1" />
          {/* Левая стена */}
          <path d="M 40 170 L 120 70 L 120 10 L 40 110 Z" fill="#252530" stroke="#333344" strokeWidth="1" />
          {/* Правая стена */}
          <path d="M 200 120 L 120 70 L 120 10 L 200 60 Z" fill="#20202A" stroke="#333344" strokeWidth="1" />
          
          {/* Детали: затемненные окна на левой стене */}
          <path d="M 55 145 L 75 120 L 75 80 L 55 105 Z" fill="#15151E" stroke="#333344" strokeWidth="0.5" />
          <path d="M 85 107 L 105 82 L 105 42 L 85 67 Z" fill="#15151E" stroke="#333344" strokeWidth="0.5" />
        </g>

        {/* 2. ОСНОВНЫЕ СБЕРЕЖЕНИЯ (Растущий 3D-объем) */}
        {h1 > 0 && (
          <g>
            {/* Левая боковая стенка заливки */}
            <path d={`M 120 220 L 40 170 L 40 ${170 - h1} L 120 ${220 - h1} Z`} fill="#D95C00" />
            {/* Правая боковая стенка заливки */}
            <path d={`M 120 220 L 200 120 L 200 ${120 - h1} L 120 ${220 - h1} Z`} fill="#F26B00" />
            {/* Верхняя светящаяся поверхность */}
            <path d={`M 120 ${220 - h1} L 40 ${170 - h1} L 120 ${70 - h1} L 200 ${120 - h1} Z`} fill="url(#main-glow)" />
            {/* Подсветка граней для реализма */}
            <line x1="40" y1={170 - h1} x2="120" y2={220 - h1} stroke="#FFAA00" strokeWidth="1.5" />
            <line x1="120" y1={220 - h1} x2="200" y2={120 - h1} stroke="#FFAA00" strokeWidth="1.5" />
          </g>
        )}

        {/* 3. КОПЕЙКА (Ложится вторым 3D-слоем ровно поверх основного) */}
        {h2 > 0 && (
          <g>
            <path d={`M 120 ${220 - h1} L 40 ${170 - h1} L 40 ${170 - h1 - h2} L 120 ${220 - h1 - h2} Z`} fill="#CC9900" />
            <path d={`M 120 ${220 - h1} L 200 ${120 - h1} L 200 ${120 - h1 - h2} L 120 ${220 - h1 - h2} Z`} fill="#E6AC00" />
            <path d={`M 120 ${220 - h1 - h2} L 40 ${170 - h1 - h2} L 120 ${70 - h1 - h2} L 200 ${120 - h1 - h2} Z`} fill="url(#kopeika-pattern)" />
            <line x1="40" y1={170 - h1 - h2} x2="120" y2={220 - h1 - h2} stroke="#FFFFFF" strokeWidth="1.5" opacity="0.8" />
            <line x1="120" y1={220 - h1 - h2} x2="200" y2={120 - h1 - h2} stroke="#FFFFFF" strokeWidth="1.5" opacity="0.8" />
          </g>
        )}
        
        {/* 4. КАРКАС ПЕРЕДНИХ СТЕН (Эффект стеклянного аквариума) */}
        <g>
          {/* Вертикальные стеклянные грани */}
          <line x1="40" y1="170" x2="40" y2="110" stroke="#444455" strokeWidth="1" />
          <line x1="120" y1="220" x2="120" y2="160" stroke="#555566" strokeWidth="1.5" strokeDasharray="3 3" /> 
          <line x1="200" y1="120" x2="200" y2="60" stroke="#444455" strokeWidth="1" />
          {/* Верхние ребра стеклянного потолка */}
          <line x1="40" y1="110" x2="120" y2="160" stroke="#555566" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="120" y1="160" x2="200" y2="60" stroke="#555566" strokeWidth="1.5" strokeDasharray="3 3" />
        </g>
      </svg>
    </div>
  );
};

export default Blueprint;