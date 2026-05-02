import { useEffect, useState } from 'react';
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

  // Обращаемся к Телеграму напрямую, без глючных библиотек!
  const WebApp = window.Telegram?.WebApp;

  useEffect(() => {
    const initTelegram = async () => {
      try {
        if (WebApp) {
          WebApp.ready();
          WebApp.expand(); // Сразу разворачиваем приложение на весь экран
        }

        const user = WebApp?.initDataUnsafe?.user;
        
        if (user) {
          // Если Телеграм на айфоне отдал данные
          setUserData(user);
          await fetchUserProgress(user.id);
        } else {
          // Если что-то пошло не так, все равно пускаем пользователя (ID-заглушка)
          const fallbackUser = { id: 1234567, first_name: 'Архитектор' };
          setUserData(fallbackUser);
          await fetchUserProgress(fallbackUser.id);
        }
      } catch (err) {
        console.error("Ошибка инициализации:", err);
        const fallbackUser = { id: 1234567, first_name: 'Архитектор' };
        setUserData(fallbackUser);
        await fetchUserProgress(fallbackUser.id);
      }
    };

    initTelegram();
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
    if (!inputArea || !inputPrice) {
      alert("Пожалуйста, заполните оба поля.");
      return;
    }

    const area = parseFloat(inputArea);
    const price = parseFloat(inputPrice);

    // Сохраняем в Supabase с помощью Upsert (создать или обновить)
    const { error } = await supabase
      .from('user_progress')
      .upsert({ 
        telegram_id: userData.id, 
        target_area: area, 
        total_price: price,
        main_savings: savings.main || 0, 
        micro_savings: savings.micro || 0
      }, { onConflict: 'telegram_id' });

    if (error) {
      alert("Ошибка БД: " + error.message);
      return;
    }

    setTargets({ area, price });
    try { WebApp?.HapticFeedback?.notificationOccurred('success'); } catch(e){}
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
        
      try { WebApp?.HapticFeedback?.impactOccurred('medium'); } catch(e){}
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
            
          try { WebApp?.HapticFeedback?.notificationOccurred('warning'); } catch(e){}
        } catch (err) {
          console.error(err);
        }
    }
  };

  if (loading) return <div style={{padding: '40px', textAlign: 'center', color: '#A0A0B0'}}>Загрузка чертежей...</div>;

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

  const safeMain = Number(savings.main) || 0;
  const safeMicro = Number(savings.micro) || 0;
  const safeArea = Number(targets.area) || 0;
  const safePrice = Number(targets.price) || 0;

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