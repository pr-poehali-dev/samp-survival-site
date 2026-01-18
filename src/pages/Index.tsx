import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CommunitySection from "@/components/CommunitySection";
import HowToPlayModal from "@/components/HowToPlayModal";

const Index = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [online, setOnline] = useState({ players: 0, maxPlayers: 100 });
  const [serverName, setServerName] = useState('SURVIVAL RP');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [settings, setSettings] = useState({ discord_link: '', vk_link: '', forum_link: '' });
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const SERVER_IP = '80.242.59.112:2073';

  const handleCopyIP = () => {
    navigator.clipboard.writeText(SERVER_IP);
    toast({
      title: "IP скопирован!",
      description: "Адрес сервера скопирован в буфер обмена",
    });
  };

  const handleConnect = () => {
    window.location.href = `samp://${SERVER_IP}`;
  };

  useEffect(() => {
    const checkAuth = () => {
      const userData = localStorage.getItem('user');
      const loginTime = localStorage.getItem('login_time');
      
      if (userData && loginTime) {
        const now = Date.now();
        const elapsed = now - parseInt(loginTime);
        const fifteenMinutes = 15 * 60 * 1000;
        
        if (elapsed < fifteenMinutes) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
          localStorage.removeItem('user');
          localStorage.removeItem('user_password');
          localStorage.removeItem('login_time');
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    const fetchOnline = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/572ddbde-507d-4153-9d42-b66188affb54?check=online', {
          signal: AbortSignal.timeout(5000)
        });
        
        if (!response.ok) {
          console.warn(`Online API returned ${response.status}`);
          return;
        }
        
        const data = await response.json();
        const newOnline = { players: data.online || 0, maxPlayers: data.maxPlayers || 100 };
        setOnline(newOnline);
      } catch (error) {
        console.error('Failed to fetch online:', error);
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
        
        const newSettings = {
          discord_link: data.discord_link || '',
          vk_link: data.vk_link || '',
          forum_link: data.forum_link || ''
        };
        
        setSettings(newSettings);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };

    checkAuth();
    fetchOnline();
    fetchSettings();
    
    const authInterval = setInterval(checkAuth, 5000);
    const onlineInterval = setInterval(fetchOnline, 5000);
    const settingsInterval = setInterval(fetchSettings, 5000);

    return () => {
      clearInterval(authInterval);
      clearInterval(onlineInterval);
      clearInterval(settingsInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: `url('https://cdn.poehali.dev/projects/bb150b69-aa78-47ca-b25a-00871a425db3/files/e11933f8-63f0-48b9-8388-339a50eaaaa6.jpg')` }}
      />
      
      <div className="blood-drip" style={{ left: '10%', top: '0', animationDelay: '0s' }} />
      <div className="blood-drip" style={{ left: '25%', top: '0', animationDelay: '0.5s', height: '80px' }} />
      <div className="blood-drip" style={{ left: '45%', top: '0', animationDelay: '1s', height: '50px' }} />
      <div className="blood-drip" style={{ left: '60%', top: '0', animationDelay: '1.5s', height: '70px' }} />
      <div className="blood-drip" style={{ left: '80%', top: '0', animationDelay: '2s', height: '90px' }} />
      <div className="blood-drip" style={{ left: '90%', top: '0', animationDelay: '0.3s' }} />
      
      <div className="relative z-10">
        <Header 
          serverName={serverName}
          isLoggedIn={isLoggedIn}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          onNavigate={navigate}
          onShowHowToPlay={() => setShowHowToPlay(true)}
        />

        <main className="pt-20">
          <HeroSection 
            serverIp={SERVER_IP}
            online={online}
            onCopyIP={handleCopyIP}
            onConnect={handleConnect}
          />

          <CommunitySection settings={settings} />

          <section id="rules" className="py-20 px-4 bg-black/40">
            <div className="container mx-auto max-w-4xl">
              <h2 className="text-4xl font-bold text-center mb-12 neon-text">Правила сервера</h2>
              
              <div className="space-y-6">
                <Card className="bg-black/60 backdrop-blur-md border-primary/30 p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Icon name="UserCheck" size={24} className="text-primary" />
                    Правила для игроков
                  </h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Запрещено использование читов и багов</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Уважайте других игроков</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Соблюдайте правила РП-отыгровки</span>
                    </li>
                  </ul>
                </Card>

                <Card className="bg-black/60 backdrop-blur-md border-primary/30 p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Icon name="Shield" size={24} className="text-primary" />
                    Правила для фракций
                  </h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Захват территорий только в определённое время</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Соблюдайте устав своей фракции</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Кооперация между кланами разрешена</span>
                    </li>
                  </ul>
                </Card>

                <Card className="bg-black/60 backdrop-blur-md border-primary/30 p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Icon name="AlertTriangle" size={24} className="text-primary" />
                    Общие правила
                  </h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Запрещён спам и флуд в чате</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Реклама других серверов запрещена</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Прислушивайтесь к администрации</span>
                    </li>
                  </ul>
                </Card>
              </div>
            </div>
          </section>

          <footer className="py-8 px-4 border-t border-white/10">
            <div className="container mx-auto text-center text-gray-400 text-sm">
              <p>© 2023-2026 Survival RP. Все права защищены.</p>
              <p className="mt-2">Постапокалиптический ролевой проект GTA SAMP • Основан в 2023 году</p>
            </div>
          </footer>
        </main>
      </div>

      <HowToPlayModal 
        showHowToPlay={showHowToPlay}
        serverIp={SERVER_IP}
        onClose={() => setShowHowToPlay(false)}
        onCopyIP={handleCopyIP}
      />
    </div>
  );
};

export default Index;