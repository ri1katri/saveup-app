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

  // Состояния для кастомного ввода
  const [customMainInput, setCustomMainInput] = useState('');
  const [customMicroInput, setCustomMicroInput] = useState('');

  useEffect(() => {
    WebApp.ready(); // Сообщаем Телеграму, что приложение готово
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

    // Добавлена проверка на ошибки при сохранении!
    const { error } = await supabase
      .from('user_progress')
      .update({ target_area: area, total_price: price })
      .eq('telegram_id', userData.id);

    if (error) {
      alert("Ошибка сохранения! Проверьте, отключен ли RLS в Supabase. Детали: " + error.message);
      return;
    }

    setTargets({ area, price });
    WebApp.HapticFeedback.notificationOccurred('success');
  };

  const addDeposit = async (type) => {
    if (!userData) return;
    const amount = type === 'main' ? parseFloat(customMainInput) : parseFloat(customMicroInput);
    if (!amount || isNaN(amount) || amount <= 0) return;

    const newMain = type === 'main' ? savings.main + amount : savings.main;
    const newMicro = type === 'micro' ? savings.micro + amount : savings.micro;

    setSavings({ main: newMain, micro: newMicro });

    await supabase
      .from('user_progress')
      .update({ main_savings: newMain, micro_savings: newMicro })
      .eq('telegram_id', userData.id);
      
    if (type === 'main') setCustomMainInput('');
    if (type === 'micro') setCustomMicroInput('');
    
    WebApp.HapticFeedback.impactOccurred('medium');
  };

  const resetProject = async () => {
    if (!userData) return;
    const isConfirmed = window.confirm("Вы уверены, что хотите обнулить весь проект и начать заново? Данные будут удалены.");
    
    if (isConfirmed) {
        setSavings({ main: 0, micro: 0 });
        setTargets({ area: null, price: null });
        
        await supabase
          .from('user_progress')
          .update({ main_savings: 0, micro_savings: 0, target_area: null, total_price: null })
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
      </div>
      
      <Blueprint mainSaved={savings.main} microSaved={savings.micro} totalPrice={targets.price} />
      
      <div className="stats-card">
        {/* Поменяли местами м2 и см2 */}
        <h2>Моя территория: {progress.purchasedM2} m²</h2>
        <p>Или {progress.purchasedCm2.toLocaleString('ru-RU')} cm²</p>
        <p>Накоплено: {progress.totalSaved.toLocaleString('ru-RU')} ₽ ({progress.percentComplete}%)</p>
      </div>

      <div className="actions">
        {/* Блок основного взноса */}
        <div className="deposit-column">
            <input 
                type="number" 
                placeholder="Внесите сумму основного пополнения" 
                value={customMainInput}
                onChange={(e) => setCustomMainInput(e.target.value)}
                className="deposit-input"
            />
            <button onClick={() => addDeposit('main')} className="main-btn-small">Внести</button>
        </div>

        {/* Блок Копейки */}
        <div className="deposit-column">
            <input 
                type="number" 
                placeholder='Внесите сумму "Копейка метр бережет"' 
                value={customMicroInput}
                onChange={(e) => setCustomMicroInput(e.target.value)}
                className="deposit-input"
            />
            <button onClick={() => addDeposit('micro')} className="micro-btn-small">Внести КОПЕЙКА МЕТР БЕРЕЖЕТ</button>
        </div>
      </div>

      {/* Кнопка сброса всего проекта */}
      <button onClick={resetProject} className="reset-project-btn">Начать заново (Сбросить проект)</button>
    </div>
  );
}

export default App;