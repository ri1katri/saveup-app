import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import { supabase } from './supabaseClient';
import { calculateProgress } from './utils';
import Blueprint from './Blueprint';
import './App.css';

function App() {
  const [userData, setUserData] = useState(null);
  const [savings, setSavings] = useState({ main: 0, micro: 0 });
  
  // Добавляем состояние для целей пользователя
  const [targets, setTargets] = useState({ area: null, price: null });
  
  const [loading, setLoading] = useState(true);

  // Временные состояния для формы ввода
  const [inputArea, setInputArea] = useState('');
  const [inputPrice, setInputPrice] = useState('');

  useEffect(() => {
    const initData = WebApp.initDataUnsafe;
    const user = initData?.user;
    
    if (user) {
      setUserData(user);
      fetchUserProgress(user.id);
    } else {
      setUserData({ id: 12345, first_name: 'TestUser' });
      fetchUserProgress(12345);
    }
  }, []);

  const fetchUserProgress = async (telegramId) => {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('telegram_id', telegramId)
      .single();

    if (error && error.code === 'PGRST116') {
      await supabase.from('user_progress').insert([{ telegram_id: telegramId }]);
    } else if (data) {
      setSavings({ main: data.main_savings, micro: data.micro_savings });
      // Загружаем цели из базы
      setTargets({ area: data.target_area, price: data.total_price });
    }
    setLoading(false);
  };

  const saveTargets = async () => {
    if (!inputArea || !inputPrice || !userData) return;
    
    const area = parseFloat(inputArea);
    const price = parseFloat(inputPrice);

    // Сохраняем в базу данных
    await supabase
      .from('user_progress')
      .update({ target_area: area, total_price: price })
      .eq('telegram_id', userData.id);

    // Обновляем экран
    setTargets({ area, price });
    WebApp.HapticFeedback.notificationOccurred('success');
  };

  const addDeposit = async (amount, type = 'main') => {
    if (!userData) return;
    const newMain = type === 'main' ? savings.main + amount : savings.main;
    const newMicro = type === 'micro' ? savings.micro + amount : savings.micro;

    setSavings({ main: newMain, micro: newMicro });

    await supabase
      .from('user_progress')
      .update({ main_savings: newMain, micro_savings: newMicro })
      .eq('telegram_id', userData.id);
      
    WebApp.HapticFeedback.impactOccurred('medium');
  };

  if (loading) return <div className="loading">Подготовка документов...</div>;

  // ЭКРАН 1: ОНБОРДИНГ (Если цели еще не заданы)
  if (!targets.area || !targets.price) {
    return (
      <div className="onboarding">
        <h1>Добро пожаловать</h1>
        <p>Давайте спроектируем ваше будущее жилье.</p>
        
        <div className="input-group">
          <label>Желаемая площадь (m²)</label>
          <input 
            type="number" 
            placeholder="Например: 30" 
            value={inputArea} 
            onChange={(e) => setInputArea(e.target.value)} 
          />
        </div>

        <div className="input-group">
          <label>Ориентировочная цена (₽)</label>
          <input 
            type="number" 
            placeholder="Например: 15000000" 
            value={inputPrice} 
            onChange={(e) => setInputPrice(e.target.value)} 
          />
        </div>

        <button onClick={saveTargets} className="main-btn">Создать проект</button>
      </div>
    );
  }

  // ЭКРАН 2: ГЛАВНЫЙ ДАШБОРД (Если цели заданы)
  const progress = calculateProgress(savings.main, savings.micro, targets.area, targets.price);

  return (
    <div className="dashboard">
      <h1>Метрика</h1>
      <p>Проект: {targets.area} m² | Цель: {targets.price.toLocaleString('ru-RU')} ₽</p>
      
      <Blueprint mainSaved={savings.main} microSaved={savings.micro} totalPrice={targets.price} />
      
      <div className="stats-card">
        <h2>Моя территория: {progress.purchasedCm2.toLocaleString('ru-RU')} cm²</h2>
        <p>Или {progress.purchasedM2} m²</p>
        <p>Накоплено: {progress.totalSaved.toLocaleString('ru-RU')} ₽ ({progress.percentComplete}%)</p>
      </div>

      <div className="actions">
        <button onClick={() => addDeposit(5000, 'main')} className="main-btn">
          Взнос (+5000 ₽)
        </button>
        <button onClick={() => addDeposit(150, 'micro')} className="micro-btn">
          Копейка (+150 ₽)
        </button>
      </div>
    </div>
  );
}

export default App;