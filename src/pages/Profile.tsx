import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface UserData {
  [key: string]: any;
}

const Profile = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [serverName, setServerName] = useState('SURVIVAL RP');
  const navigate = useNavigate();

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
        const response = await fetch('https://functions.poehali.dev/7429a9b5-8d13-44b6-8a20-67ccba23e8f8');
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
    
    const userInterval = setInterval(refreshUserData, 1000);
    const settingsInterval = setInterval(fetchSettings, 3000);
    
    return () => {
      clearInterval(userInterval);
      clearInterval(settingsInterval);
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
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
    const hours = user?.u_lifegame || 0;
    
    if (hours === 0) {
      return '0ч';
    }
    return `${hours}ч`;
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
    };
    return translations[key] || key.replace(/_/g, ' ');
  };

  const isAdmin = () => {
    const adminLevel = user?.admin_level || 0;
    return Number(adminLevel) >= 6;
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
        <header className="bg-black/80 backdrop-blur-md border-b border-white/10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="text-2xl font-bold text-gradient">{serverName}</div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/")}>
                <Icon name="Home" size={18} className="mr-2" />
                Главная
              </Button>
              {isAdmin() && (
                <Button variant="ghost" onClick={() => navigate("/admin")} className="text-primary">
                  <Icon name="Settings" size={18} className="mr-2" />
                  Админ-панель
                </Button>
              )}
              <Button variant="outline" onClick={handleLogout} className="border-primary/30">
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
                    <div className="text-2xl font-bold text-blue-500">{getStatValue('u_level') || getStatValue('level')}</div>
                  </div>
                </div>
              </Card>

              <Card className="bg-black/60 backdrop-blur-md border-primary/30 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Icon name="DollarSign" size={32} className="text-green-500" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Деньги</div>
                    <div className="text-2xl font-bold">${getStatValue('u_money') || getStatValue('money') || '0'}</div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-black/60 backdrop-blur-md border-primary/30 p-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Icon name="User" size={24} className="text-primary" />
                  Основная информация
                </h2>
                <div className="space-y-4">
                  {Object.entries(user)
                    .filter(([key]) => !key.toLowerCase().includes('pass') && !key.toLowerCase().includes('password'))
                    .slice(0, 10)
                    .map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center border-b border-white/10 pb-2">
                        <span className="text-gray-400">{translateField(key)}</span>
                        <span className="font-medium">
                          {value === null || value === undefined ? '-' : value.toString()}
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
                  <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <Icon name="Trophy" size={24} className="text-green-500" />
                    <div>
                      <div className="font-bold text-green-500">Выживший</div>
                      <div className="text-sm text-green-500/70">Прожил 7 дней подряд</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <Icon name="Skull" size={24} className="text-green-500" />
                    <div>
                      <div className="font-bold text-green-500">Охотник на зомби</div>
                      <div className="text-sm text-green-500/70">Убил 100 зомби</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <Icon name="Users" size={24} className="text-green-500" />
                    <div>
                      <div className="font-bold text-green-500">Командный игрок</div>
                      <div className="text-sm text-green-500/70">Вступил в клан</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="bg-black/60 backdrop-blur-md border-primary/30 p-6 mt-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Icon name="Activity" size={24} className="text-primary" />
                Статистика
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <Icon name="Crosshair" size={32} className="mx-auto mb-2 text-yellow-500" />
                  <div className="text-2xl font-bold text-yellow-500">{getStatValue('u_kills') || '0'}</div>
                  <div className="text-sm text-yellow-500/70">Убийств</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <Icon name="Heart" size={32} className="mx-auto mb-2 text-red-500" />
                  <div className="text-2xl font-bold">{getStatValue('u_deaths') || '0'}</div>
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
    </div>
  );
};

export default Profile;