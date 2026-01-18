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
    const seconds = user?.u_playtime || user?.playtime || 0;
    const hours = Math.floor(seconds / 3600);
    return hours;
  };

  const translateField = (key: string): string => {
    const translations: {[key: string]: string} = {
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
    const adminLevel = user?.u_admin || user?.admin || user?.u_admin_level || 0;
    return Number(adminLevel) >= 6;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: `url('https://cdn.poehali.dev/projects/bb150b69-aa78-47ca-b25a-00871a425db3/files/e11933f8-63f0-48b9-8388-339a50eaaaa6.jpg')` }}
      />
      
      <div className="relative z-10">
        <header className="bg-black/80 backdrop-blur-md border-b border-white/10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="text-2xl font-bold text-gradient">SURVIVAL RP</div>
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

              <Card className="bg-black/60 backdrop-blur-md border-primary/30 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center">
                    <Icon name="TrendingUp" size={32} className="text-secondary" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Уровень</div>
                    <div className="text-2xl font-bold">{getStatValue('u_level') || getStatValue('level')}</div>
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

              <Card className="bg-black/60 backdrop-blur-md border-primary/30 p-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Icon name="Award" size={24} className="text-primary" />
                  Достижения
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                    <Icon name="Trophy" size={24} className="text-primary" />
                    <div>
                      <div className="font-bold">Выживший</div>
                      <div className="text-sm text-gray-400">Прожил 7 дней подряд</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                    <Icon name="Skull" size={24} className="text-primary" />
                    <div>
                      <div className="font-bold">Охотник на зомби</div>
                      <div className="text-sm text-gray-400">Убил 100 зомби</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                    <Icon name="Users" size={24} className="text-primary" />
                    <div>
                      <div className="font-bold">Командный игрок</div>
                      <div className="text-sm text-gray-400">Вступил в клан</div>
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
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <Icon name="Crosshair" size={32} className="mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{getStatValue('u_kills') || '0'}</div>
                  <div className="text-sm text-gray-400">Убийств</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <Icon name="Heart" size={32} className="mx-auto mb-2 text-red-500" />
                  <div className="text-2xl font-bold">{getStatValue('u_deaths') || '0'}</div>
                  <div className="text-sm text-gray-400">Смертей</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <Icon name="Clock" size={32} className="mx-auto mb-2 text-secondary" />
                  <div className="text-2xl font-bold">{formatPlayTime()}ч</div>
                  <div className="text-sm text-gray-400">Наиграно</div>
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