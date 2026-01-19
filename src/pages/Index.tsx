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
  const [serverName, setServerName] = useState('Дозор Смерти / Death Watch');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [settings, setSettings] = useState({ discord_link: '', vk_link: '', forum_link: '' });
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [rules, setRules] = useState<any[]>([]);
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
    const checkAuth = async () => {
      const userData = localStorage.getItem('user');
      const loginTime = localStorage.getItem('login_time');
      const password = localStorage.getItem('user_password');
      
      if (userData && loginTime) {
        const now = Date.now();
        const elapsed = now - parseInt(loginTime);
        const twentyFourHours = 24 * 60 * 60 * 1000;
        
        if (elapsed < twentyFourHours) {
          setIsLoggedIn(true);
          
          // Обновляем данные пользователя в фоне
          try {
            const user = JSON.parse(userData);
            const username = user.u_name || user.username;
            
            if (username && password) {
              const response = await fetch('https://functions.poehali.dev/572ddbde-507d-4153-9d42-b66188affb54', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login: username, password })
              });

              if (response.ok) {
                const data = await response.json();
                if (data.success && data.user) {
                  localStorage.setItem("user", JSON.stringify(data.user));
                  localStorage.setItem("login_time", Date.now().toString());
                }
              }
            }
          } catch (error) {
            console.error('Failed to refresh user data:', error);
          }
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

    const fetchRules = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/353a7f9f-c1a8-4395-9120-78c37baa0419', {
          signal: AbortSignal.timeout(5000)
        });
        
        if (!response.ok) {
          console.warn(`Rules API returned ${response.status}`);
          return;
        }
        
        const data = await response.json();
        setRules(data.rules || []);
      } catch (error) {
        console.error('Failed to fetch rules:', error);
      }
    };

    checkAuth();
    fetchSettings();
    fetchRules();
    
    const authInterval = setInterval(checkAuth, 5000);
    const settingsInterval = setInterval(fetchSettings, 5000);
    const rulesInterval = setInterval(fetchRules, 30000);

    return () => {
      clearInterval(authInterval);
      clearInterval(settingsInterval);
      clearInterval(rulesInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: `url('https://cdn.poehali.dev/projects/bb150b69-aa78-47ca-b25a-00871a425db3/files/e11933f8-63f0-48b9-8388-339a50eaaaa6.jpg')` }}
      />
      
      <div className="blood-trail" style={{ left: '5%', animationDelay: '0s' }} />
      <div className="blood-trail" style={{ left: '15%', animationDelay: '1.2s', height: '100px' }} />
      <div className="blood-trail" style={{ left: '30%', animationDelay: '0.8s', height: '60px' }} />
      <div className="blood-trail" style={{ left: '48%', animationDelay: '2s', height: '90px' }} />
      <div className="blood-trail" style={{ left: '62%', animationDelay: '1.5s', height: '70px' }} />
      <div className="blood-trail" style={{ left: '77%', animationDelay: '0.4s', height: '110px' }} />
      <div className="blood-trail" style={{ left: '88%', animationDelay: '2.3s', height: '80px' }} />
      <div className="blood-trail" style={{ left: '95%', animationDelay: '0.9s' }} />
      
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
            onCopyIP={handleCopyIP}
            onConnect={handleConnect}
          />

          <CommunitySection settings={settings} />

          <section id="rules" className="py-20 px-4 bg-black/40">
            <div className="container mx-auto max-w-4xl">
              <h2 className="text-4xl font-bold text-center mb-12 neon-text">Правила сервера</h2>
              
              <div className="space-y-6">
                {['players', 'factions', 'general'].map((category) => {
                  const categoryRules = rules.filter(r => r.category === category);
                  if (categoryRules.length === 0) return null;
                  
                  const categoryLabels: Record<string, string> = {
                    players: 'Правила для игроков',
                    factions: 'Правила для фракций',
                    general: 'Общие правила'
                  };
                  
                  const categoryIcons: Record<string, string> = {
                    players: 'UserCheck',
                    factions: 'Shield',
                    general: 'AlertTriangle'
                  };
                  
                  return (
                    <Card key={category} className="bg-black/60 backdrop-blur-md border-primary/30 p-6">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Icon name={categoryIcons[category]} size={24} className="text-primary" />
                        {categoryLabels[category]}
                      </h3>
                      <ul className="space-y-2 text-gray-300">
                        {categoryRules.map((rule) => (
                          <li key={rule.id} className="flex gap-2">
                            <span className="text-primary">•</span>
                            <span>{rule.title}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>

          <footer className="py-8 px-4 border-t border-white/10">
            <div className="container mx-auto text-center text-gray-400 text-sm">
              <p>© 2023-2026 {serverName}. Все права защищены.</p>
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