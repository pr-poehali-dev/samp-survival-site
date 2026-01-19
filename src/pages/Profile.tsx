import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileStatsCards } from "@/components/profile/ProfileStatsCards";
import { ProfileInfoSection } from "@/components/profile/ProfileInfoSection";
import { ProfileGameStats } from "@/components/profile/ProfileGameStats";

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

  const handleDonateSubmit = async () => {
    const amount = parseInt(donateAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Ошибка",
        description: "Введите корректную сумму",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/9d2c3abd-1e9b-47bb-aa92-279754af5495', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_payment',
          amount,
          user_id: user?.u_id || user?.id,
          username: user?.u_name || user?.username
        })
      });

      const data = await response.json();

      if (data.success && data.payment_url) {
        window.open(data.payment_url, '_blank');
        toast({
          title: "Перенаправление на оплату",
          description: "Откроется страница Альфа-Банка для оплаты",
        });
      } else {
        toast({
          title: "Ошибка",
          description: data.error || "Не удалось создать платеж",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка сети",
        description: "Не удалось подключиться к серверу оплаты",
        variant: "destructive"
      });
    }
    
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
        <ProfileHeader 
          serverName={serverName}
          isAdmin={isAdmin()}
          onNavigate={navigate}
          onLogout={handleLogout}
        />

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-black mb-2 neon-text">Личный кабинет</h1>
              <p className="text-gray-400">Информация о вашем игровом персонаже</p>
            </div>

            <ProfileStatsCards user={user} getStatValue={getStatValue} />

            <ProfileInfoSection
              user={user}
              getStatValue={getStatValue}
              translateField={translateField}
              formatFieldValue={formatFieldValue}
              onDonateClick={() => setShowDonateModal(true)}
            />

            <ProfileGameStats
              user={user}
              formatPlayTime={formatPlayTime}
              getKillStats={getKillStats}
              showDonateModal={showDonateModal}
              donateAmount={donateAmount}
              setDonateAmount={setDonateAmount}
              setShowDonateModal={setShowDonateModal}
              handleDonateSubmit={handleDonateSubmit}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;