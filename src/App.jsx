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

  const [inputArea, setInputArea] = useState('');
  const [inputPrice, setInputPrice] = useState('');

  const [customMainInput, setCustomMainInput] = useState('');
  const [customMicroInput, setCustomMicroInput] = useState('');

  useEffect(() => {
    try {
      WebApp.ready();
      const initData = WebApp.initDataUnsafe;
      const user = initData?.user;
      
      if (user) {
        setUserData(user);
        fetchUserProgress(user.id);
      } else {
        // Заглушка для браузера
        setUserData({ id: 12345, first_name: 'TestUser' });
        fetchUserProgress(12345);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, []);

  const fetchUserProgress = async (telegramId) => {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('telegram_id', telegramId)
        .single();

      if (error && error.code === 'PGRST116') {
        await supabase.from('user_progress').insert([{ telegram_id: telegramId }]);
      } else if (data) {
        // Жесткая защита: если данных нет, ставим 0
        setSavings({ main: Number(data.main_savings) || 0, micro: Number(data.micro_savings) || 0 });
        setTargets({ area: Number(data.target_area) || null, price: Number(data.total_price) || null });
      }
    } catch (err) {
      console.error("Ошибка БД:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveTargets = async () => {
    if (!inputArea || !inputPrice || !userData) return;
    const area = parseFloat(inputArea);
    const price = parseFloat(inputPrice);

    try {
      await supabase
        .from('user_progress')
        .update({ target_area: area, total_price: price })
        .eq('telegram_id', userData.id);

      setTargets({ area, price });
      WebApp.HapticFeedback.notificationOccurred('success');
    } catch (err) {
      alert("Не удалось сохранить. Проверьте интернет.");
    }
  };

  const addDeposit = async (type) => {
    if (!userData) return;
    const amount = type === 'main' ? parseFloat(customMainInput) : parseFloat(customMicroInput);
    if (!amount || isNaN(amount) || amount <= 0) return;

    const safeMain = Number(savings.main) || 0;
    const safeMicro = Number(savings.micro) || 0;

    const newMain = type === 'main' ? safeMain + amount : safeMain;
    const newMicro = type === 'micro' ? safeMicro + amount : safeMicro;

    setSavings({ main: newMain, micro: newMicro });

    if (type === 'main') setCustomMainInput('');
    if (type === 'micro') setCustomMicroInput('');

    try {
      await supabase
        .from('user_progress')
        .update({ main_savings: newMain, micro_savings: newMicro })
        .eq('telegram_id', userData.id);
        
      WebApp.HapticFeedback.impactOccurred('medium');
    } catch (err) {
      console.error(err);
    }
  };

  const resetProject = async () => {
    if (!userData) return;
    const isConfirmed = window.confirm("Вы уверены, что хотите обнулить весь проект и начать заново? Данные будут удалены.");
    
    if (isConfirmed) {
        setSavings({ main: 0, micro: 0 });
        setTargets({ area: null, price: null });
        
        try {
          await supabase
            .from('user_progress')
            .update({ main_savings: 0, micro_savings: 0, target_area: null, total_price: null })
            .eq('telegram_id', userData.id);
            
          WebApp.HapticFeedback.notificationOccurred('warning');
        } catch (err) {
          console.error(err);
        }
    }
  };

  // Базовый экран загрузки
  if (loading) return <div style={{padding: '40px', textAlign: 'center', color: '#A0A0B0'}}>Загрузка чертежей...</div>;

  // Экран онбординга
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

  // --- ТОТАЛЬНАЯ ЗАЩИТА ВЫЧИСЛЕНИЙ ---
  const safeMain = Number(savings.main) || 0;
  const safeMicro = Number(savings.micro) || 0;
  const safeArea = Number(targets.area) || 0;
  const safePrice = Number(targets.price) || 0;

  // Если утилита сломается, отдаем нули, но не крашим приложение
  const progress = calculateProgress(safeMain, safeMicro, safeArea, safePrice) || {
    totalSaved: 0,
    purchasedCm2: 0,
    purchasedM2: "0.0000",
    percentComplete: "0.00"
  };

  return (
    <div className="dashboard">
      <div className="header-row">
          <div>
            <h1>Метрика</h1>
            <p>Студия: {safeArea} m² | Цель: {safePrice.toLocaleString('ru-RU')} ₽</p>
          </div>
      </div>
      
      <Blueprint mainSaved={safeMain} microSaved={safeMicro} totalPrice={safePrice} />
      
      <div className="stats-card">
        <h2>Моя территория: {progress?.purchasedM2 || 0} m²</h2>
        <p>Или {Number(progress?.purchasedCm2 || 0).toLocaleString('ru-RU')} cm²</p>
        <p>Накоплено: {Number(progress?.totalSaved || 0).toLocaleString('ru-RU')} ₽ ({progress?.percentComplete || 0}%)</p>
      </div>

      <div className="actions">
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

      <button onClick={resetProject} className="reset-project-btn">Начать заново (Сбросить проект)</button>
    </div>
  );
}

export default App;
