import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import { supabase } from './supabaseClient';
import { calculateProgress } from './utils';
import Blueprint from './Blueprint';
import './App.css';

function App() {
  const [userData, setUserData] = useState(null);
  const [savings, setSavings] = useState({ main: 0, micro: 0 });
  const [targets, setTargets] = useState({ area: null, price: null });
  const [loading, setLoading] = useState(true);

  // Состояния для онбординга
  const [inputArea, setInputArea] = useState('');
  const [inputPrice, setInputPrice] = useState('');

  // Состояния для кастомного ввода депозитов
  const [customMainInput, setCustomMainInput] = useState('');
  const [customMicroInput, setCustomMicroInput] = useState('');

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
      setTargets({ area: data.target_area, price: data.total_price });
    }
    setLoading(false);
  };

  const saveTargets = async () => {
    if (!inputArea || !inputPrice || !userData) return;
    const area = parseFloat(inputArea);
    const price = parseFloat(inputPrice);

    await supabase
      .from('user_progress')
      .update({ target_area: area, total_price: price })
      .eq('telegram_id', userData.id);

    setTargets({ area, price });
    WebApp.HapticFeedback.notificationOccurred('success');
  };

  // Обновленная функция для кастомных сумм
  const addDeposit = async (type) => {
    if (!userData) return;
    
    // Берем значение из нужного инпута
    const amount = type === 'main' ? parseFloat(customMainInput) : parseFloat(customMicroInput);
    
    // Защита от пустых или нулевых значений
    if (!amount || isNaN(amount) || amount <= 0) return;

    const newMain = type === 'main' ? savings.main + amount : savings.main;
    const newMicro = type === 'micro' ? savings.micro + amount : savings.micro;

    setSavings({ main: newMain, micro: newMicro });

    await supabase
      .from('user_progress')
      .update({ main_savings: newMain, micro_savings: newMicro })
      .eq('telegram_id', userData.id);
      
    // Очищаем инпут после успешного добавления
    if (type === 'main') setCustomMainInput('');
    if (type === 'micro') setCustomMicroInput('');
    
    WebApp.HapticFeedback.impactOccurred('medium');
  };

  // Новая функция: Сброс прогресса
  const resetProgress = async () => {
    if (!userData) return;
    
    // Системное окно подтверждения (нативное для iOS/Android)
    const isConfirmed = window.confirm("Вы уверены, что хотите обнулить весь прогресс? Это действие нельзя отменить.");
    
    if (isConfirmed) {
        setSavings({ main: 0, micro: 0 });
        
        await supabase
          .from('user_progress')
          .update({ main_savings: 0, micro_savings: 0 })
          .eq('telegram_id', userData.id);
          
        WebApp.HapticFeedback.notificationOccurred('warning');
    }
  };

  if (loading) return <div className="loading">Подготовка документов...</div>;

  if (!targets.area || !targets.price) {
    return (
      <div className="onboarding">
        <h1>Добро пожаловать</h1>
        <p>Давайте спроектируем ваше будущее жилье.</p>
        <div className="input-group">
          <label>Желаемая площадь (m²)</label>
          <input type="number" placeholder="Например: 30" value={inputArea} onChange={(e) => setInputArea(e.target.value)} />
        </div>
        <div className="input-group">
          <label>Ориентировочная цена (₽)</label>
          <input type="number" placeholder="Например: 15000000" value={inputPrice} onChange={(e) => setInputPrice(e.target.value)} />
        </div>
        <button onClick={saveTargets} className="main-btn">Создать проект</button>
      </div>
    );
  }

  const progress = calculateProgress(savings.main, savings.micro, targets.area, targets.price);

  return (
    <div className="dashboard">
      <div className="header-row">
          <div>
            <h1>Метрика</h1>
            <p>Студия: {targets.area} m² | Цель: {targets.price.toLocaleString('ru-RU')} ₽</p>
          </div>
          <button onClick={resetProgress} className="reset-btn" title="Сбросить прогресс">↺</button>
      </div>
      
      <Blueprint mainSaved={savings.main} microSaved={savings.micro} totalPrice={targets.price} />
      
      <div className="stats-card">
        <h2>Моя территория: {progress.purchasedCm2.toLocaleString('ru-RU')} cm²</h2>
        <p>Или {progress.purchasedM2} m²</p>
        <p>Накоплено: {progress.totalSaved.toLocaleString('ru-RU')} ₽ ({progress.percentComplete}%)</p>
      </div>

      <div className="actions">
        {/* Инпут + Кнопка для Основного взноса */}
        <div className="deposit-row">
            <input 
                type="number" 
                placeholder="Сумма взноса..." 
                value={customMainInput}
                onChange={(e) => setCustomMainInput(e.target.value)}
                className="deposit-input"
            />
            <button onClick={() => addDeposit('main')} className="main-btn-small">Внести</button>
        </div>

        {/* Инпут + Кнопка для Копейки */}
        <div className="deposit-row">
            <input 
                type="number" 
                placeholder="Сумма сдачи..." 
                value={customMicroInput}
                onChange={(e) => setCustomMicroInput(e.target.value)}
                className="deposit-input"
            />
            <button onClick={() => addDeposit('micro')} className="micro-btn-small">Копейка</button>
        </div>
      </div>
    </div>
  );
}

export default App;