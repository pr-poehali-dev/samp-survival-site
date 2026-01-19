import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UserData {
  [key: string]: any;
}

const Profile = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [serverName, setServerName] = useState('SURVIVAL RP');
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donateAmount, setDonateAmount] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(userData);
    console.log('Profile - User data:', parsedUser);
    console.log('Profile - All keys:', Object.keys(parsedUser));
    setUser(parsedUser);

    const refreshUserData = async () => {
      try {
        const username = parsedUser.u_name || parsedUser.username;
        const password = localStorage.getItem("user_password");
        
        if (!username || !password) return;

        const response = await fetch('https://functions.poehali.dev/572ddbde-507d-4153-9d42-b66188affb54', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ login: username, password })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setUser(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        }
      } catch (error) {
        console.error('Failed to refresh user data:', error);
      }
    };

    const fetchSettings = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/7429a9b5-8d13-44b6-8a20-67ccba23e8f8', {
          signal: AbortSignal.timeout(5000)
        });
        
        if (!response.ok) {
          console.warn(`Settings API returned ${response.status}`);
          return;
        }
        
        const data = await response.json();
        
        if (data.server_name) {
          setServerName(data.server_name);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };

    refreshUserData();
    fetchSettings();
    
    const userInterval = setInterval(refreshUserData, 5000);
    const settingsInterval = setInterval(fetchSettings, 5000);
    
    return () => {
      clearInterval(userInterval);
      clearInterval(settingsInterval);
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("user_password");
    localStorage.removeItem("login_time");
    navigate("/");
  };

  if (!user) {
    return null;
  }

  const getStatValue = (key: string) => {
    const value = user[key];
    if (value === null || value === undefined) return "-";
    return value.toString();
  };

  const formatPlayTime = () => {
    const totalSeconds = user?.u_lifetime || 0;
    
    if (totalSeconds === 0) {
      return '0с';
    }
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours === 0 && minutes === 0) {
      return `${totalSeconds}с`;
    }
    return `${hours}ч ${minutes}мин`;
  };

  const getKillStats = () => {
    const killData = user?.u_kill || '0,0';
    const [zombies, players] = killData.split(',').map(Number);
    return { zombies, players };
  };

  const translateField = (key: string): string => {
    const translations: {[key: string]: string} = {
      'admin_level': 'Уровень админки',
      'u_id': 'ID',
      'u_name': 'Имя',
      'u_level': 'Уровень',
      'u_money': 'Деньги',
      'u_bank': 'Банк',
      'u_donate': 'Донат',
      'u_kills': 'Убийств',
      'u_deaths': 'Смертей',
      'u_playtime': 'Время игры',
      'u_score': 'Очки',
      'u_reg_date': 'Дата регистрации',
      'u_last_login': 'Последний вход',
      'u_admin': 'Админ уровень',
      'u_email': 'Email',
      'u_ip_registration': 'IP регистрации',
      'u_date_registration': 'Дата регистрации',
      'u_gender': 'Пол',
      'u_friend': 'Пригласивший друг',
      'u_adverting': 'Достижения',
      'u_skin': 'Скин',
    };
    return translations[key] || key.replace(/_/g, ' ');
  };

  const formatFieldValue = (key: string, value: any): string => {
    if (value === null || value === undefined) return '-';
    
    if (key === 'u_gender') {
      return value === 0 ? 'Женский' : 'Мужской';
    }
    
    return value.toString();
  };

  const isAdmin = () => {
    const adminLevel = user?.admin_level || 0;
    return Number(adminLevel) >= 6;
  };

  const handleDonateSubmit = () => {
    const amount = parseInt(donateAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Ошибка",
        description: "Введите корректную сумму",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Пополнение доната",
      description: `Для пополнения на ${amount}₽ обратитесь к администрации сервера`,
    });
    
    setShowDonateModal(false);
    setDonateAmount('');
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: `url('https://cdn.poehali.dev/projects/bb150b69-aa78-47ca-b25a-00871a425db3/files/e11933f8-63f0-48b9-8388-339a50eaaaa6.jpg')` }}
      />
      
      <div className="blood-drip" style={{ left: '15%', top: '0', animationDelay: '0.2s' }} />
      <div className="blood-drip" style={{ left: '35%', top: '0', animationDelay: '0.8s', height: '75px' }} />
      <div className="blood-drip" style={{ left: '55%', top: '0', animationDelay: '1.2s', height: '55px' }} />
      <div className="blood-drip" style={{ left: '75%', top: '0', animationDelay: '1.8s', height: '85px' }} />
      
      <div className="relative z-10">
        <header className="bg-transparent border-b border-white/10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="text-2xl font-bold text-white">{serverName}</div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/")} className="text-white hover:text-white/80">
                <Icon name="Home" size={18} className="mr-2" />
                Главная
              </Button>
              {isAdmin() && (
                <Button variant="ghost" onClick={() => navigate("/admin")} className="text-red-500 hover:text-red-400">
                  <Icon name="Settings" size={18} className="mr-2" />
                  Админ-панель
                </Button>
              )}
              <Button variant="outline" onClick={handleLogout} className="border-white/30 text-white hover:bg-white/10">
                <Icon name="LogOut" size={18} className="mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-black mb-2 neon-text">Личный кабинет</h1>
              <p className="text-gray-400">Информация о вашем игровом персонаже</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-black/60 backdrop-blur-md border-primary/30 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                    <Icon name="User" size={32} className="text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Игрок</div>
                    <div className="text-2xl font-bold">{getStatValue('u_name') || getStatValue('username')}</div>
                  </div>
                </div>
              </Card>

              <Card className="bg-black/60 backdrop-blur-md border-blue-500/30 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Icon name="TrendingUp" size={32} className="text-blue-500" />
                  </div>
                  <div>
                    <div className="text-sm text-blue-500/70">Уровень</div>
                    <div className="text-2xl font-bold text-blue-500">{Math.floor((user?.u_lifegame || 0) / 60 / 60)}</div>
                  </div>
                </div>
              </Card>

              <Card className="bg-black/60 backdrop-blur-md border-primary/30 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Icon name="Wallet" size={32} className="text-green-500" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Деньги</div>
                    <div className="text-2xl font-bold">{getStatValue('u_money') || getStatValue('money') || '0'}₽</div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-black/60 backdrop-blur-md border-yellow-500/30 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <Icon name="Crown" size={32} className="text-yellow-500" />
                  </div>
                  <div>
                    <div className="text-sm text-yellow-500/70">VIP статус</div>
                    <div className="text-2xl font-bold text-yellow-500">
                      {(user?.u_vip_time || 0) > 0 ? `${Math.ceil((user?.u_vip_time || 0) / 86400)} дн.` : 'Нет'}
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="bg-black/60 backdrop-blur-md border-purple-500/30 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <Icon name="Zap" size={32} className="text-purple-500" />
                  </div>
                  <div>
                    <div className="text-sm text-purple-500/70">Статус</div>
                    <div className="text-xl font-bold text-purple-500">
                      {(user?.u_online || 0) === 1 ? '🟢 В игре' : '⚪ Оффлайн'}
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="bg-black/60 backdrop-blur-md border-green-500/30 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Icon name="Gem" size={32} className="text-green-500" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Донат валюта</div>
                    <div className="text-2xl font-bold">{getStatValue('u_donate') || '0'}Ᵽ</div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-black/60 backdrop-blur-md border-primary/30 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Icon name="User" size={24} className="text-primary" />
                    Основная информация
                  </h2>
                  <Button 
                    size="sm" 
                    onClick={() => setShowDonateModal(true)}
                    className="neon-glow"
                  >
                    <Icon name="DollarSign" size={16} className="mr-1" />
                    Пополнить
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-gray-400">Донат</span>
                    <span className="font-medium text-white">{getStatValue('u_donate') || '0'}₽</span>
                  </div>
                  {Object.entries(user)
                    .filter(([key]) => 
                      !key.toLowerCase().includes('pass') && 
                      !key.toLowerCase().includes('password') &&
                      key !== 'u_email_status' &&
                      key !== 'u_newgame' &&
                      key !== 'u_lifetime' &&
                      key !== 'u_donate'
                    )
                    .slice(0, 9)
                    .map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center border-b border-white/10 pb-2">
                        <span className="text-gray-400">{translateField(key)}</span>
                        <span className="font-medium text-white">
                          {formatFieldValue(key, value)}
                        </span>
                      </div>
                    ))}
                </div>
              </Card>

              <Card className="bg-black/60 backdrop-blur-md border-green-500/30 p-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Icon name="Award" size={24} className="text-green-500" />
                  Достижения
                </h2>
                <div className="space-y-4">
                  {(() => {
                    const achievementData = user?.u_achievement || '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0';
                    const achievements = achievementData.split(',').map(Number);
                    
                    const achievementList = [
                      { id: 0, name: 'Первый шаг', desc: 'Зарегистрировался на сервере', icon: 'UserPlus' },
                      { id: 1, name: 'Новичок', desc: 'Первый час в игре', icon: 'Clock' },
                      { id: 2, name: 'Выживший', desc: 'Прожил 7 дней подряд', icon: 'Trophy' },
                      { id: 3, name: 'Охотник на зомби', desc: 'Убил 100 зомби', icon: 'Skull' },
                      { id: 4, name: 'Торговец', desc: 'Совершил 50 сделок', icon: 'ShoppingCart' },
                      { id: 5, name: 'Богач', desc: 'Накопил 1,000,000₽', icon: 'DollarSign' },
                      { id: 6, name: 'Исследователь', desc: 'Посетил все зоны карты', icon: 'Map' },
                      { id: 7, name: 'Строитель', desc: 'Построил базу', icon: 'Home' },
                      { id: 8, name: 'Командный игрок', desc: 'Вступил в клан', icon: 'Users' },
                      { id: 9, name: 'Воин', desc: 'Убил 50 игроков', icon: 'Crosshair' },
                      { id: 10, name: 'Лекарь', desc: 'Вылечил 100 раз', icon: 'Heart' },
                      { id: 11, name: 'Механик', desc: 'Отремонтировал 100 машин', icon: 'Wrench' },
                      { id: 12, name: 'Повар', desc: 'Приготовил 200 блюд', icon: 'Utensils' },
                      { id: 13, name: 'Коллекционер', desc: 'Собрал все редкие предметы', icon: 'Package' },
                      { id: 14, name: 'Ветеран', desc: 'Играет более года', icon: 'Star' },
                      { id: 15, name: 'Легенда', desc: 'Достиг максимального уровня', icon: 'Crown' },
                    ];
                    
                    const unlockedAchievements = achievementList.filter((ach, idx) => achievements[idx] === 1);
                    
                    if (unlockedAchievements.length === 0) {
                      return (
                        <div className="text-center p-8 text-gray-500">
                          <Icon name="Award" size={48} className="mx-auto mb-4 text-gray-700" />
                          <p>Пока нет достижений</p>
                          <p className="text-sm mt-2">Играйте и открывайте новые достижения!</p>
                        </div>
                      );
                    }
                    
                    return unlockedAchievements.map((ach) => (
                      <div key={ach.id} className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <Icon name={ach.icon as any} size={24} className="text-green-500" />
                        <div>
                          <div className="font-bold text-green-500">{ach.name}</div>
                          <div className="text-sm text-green-500/70">{ach.desc}</div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </Card>
            </div>

            <Card className="bg-black/60 backdrop-blur-md border-primary/30 p-6 mt-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Icon name="Activity" size={24} className="text-primary" />
                Статистика
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <Icon name="Skull" size={32} className="mx-auto mb-2 text-yellow-500" />
                  <div className="text-2xl font-bold text-yellow-500">{getKillStats().zombies}</div>
                  <div className="text-sm text-yellow-500/70">Убито зомби</div>
                </div>
                <div className="text-center p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <Icon name="Crosshair" size={32} className="mx-auto mb-2 text-orange-500" />
                  <div className="text-2xl font-bold text-orange-500">{getKillStats().players}</div>
                  <div className="text-sm text-orange-500/70">Убито людей</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <Icon name="Heart" size={32} className="mx-auto mb-2 text-red-500" />
                  <div className="text-2xl font-bold">{getStatValue('u_death') || '0'}</div>
                  <div className="text-sm text-gray-400">Смертей</div>
                </div>
                <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <Icon name="Clock" size={32} className="mx-auto mb-2 text-purple-500" />
                  <div className="text-2xl font-bold text-purple-500">{formatPlayTime()}</div>
                  <div className="text-sm text-purple-500/70">Наиграно</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <Icon name="Target" size={32} className="mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold">{getStatValue('u_score') || '0'}</div>
                  <div className="text-sm text-gray-400">Очков</div>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>

      {showDonateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-black/90 border-primary/30 p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Icon name="DollarSign" size={24} className="text-primary" />
                Пополнение доната
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowDonateModal(false)}
              >
                <Icon name="X" size={20} />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount" className="text-white mb-2 block">
                  Сумма пополнения (₽)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={donateAmount}
                  onChange={(e) => setDonateAmount(e.target.value)}
                  placeholder="Введите сумму"
                  className="bg-black/50 border-primary/30 text-white"
                  min="1"
                />
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-sm text-yellow-500/90">
                  <Icon name="Info" size={16} className="inline mr-2" />
                  После подтверждения обратитесь к администрации сервера для завершения пополнения
                </p>
              </div>

              <Button 
                className="w-full neon-glow" 
                size="lg"
                onClick={handleDonateSubmit}
              >
                <Icon name="Check" size={20} className="mr-2" />
                Подтвердить
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Profile;