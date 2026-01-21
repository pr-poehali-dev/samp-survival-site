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
  const [categories, setCategories] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
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

    const fetchSettings = async (retryCount = 0) => {
      try {
        const response = await fetch('https://functions.poehali.dev/7429a9b5-8d13-44b6-8a20-67ccba23e8f8', {
          signal: AbortSignal.timeout(8000),
          cache: 'no-cache'
        });
        
        if (!response.ok) {
          console.warn(`Settings API returned ${response.status}`);
          if (retryCount < 2) {
            setTimeout(() => fetchSettings(retryCount + 1), 2000);
          }
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
        console.warn('Settings fetch failed, using defaults:', error);
        if (retryCount < 2) {
          setTimeout(() => fetchSettings(retryCount + 1), 2000);
        }
      }
    };

    const fetchRules = async (retryCount = 0) => {
      try {
        const response = await fetch('https://functions.poehali.dev/353a7f9f-c1a8-4395-9120-78c37baa0419', {
          signal: AbortSignal.timeout(8000),
          cache: 'no-cache'
        });
        
        if (!response.ok) {
          console.warn(`Rules API returned ${response.status}`);
          if (retryCount < 2) {
            setTimeout(() => fetchRules(retryCount + 1), 2000);
          }
          return;
        }
        
        const data = await response.json();
        setRules(data.rules || []);
      } catch (error) {
        console.warn('Rules fetch failed:', error);
        if (retryCount < 2) {
          setTimeout(() => fetchRules(retryCount + 1), 2000);
        }
      }
    };

    const loadCategories = () => {
      const saved = localStorage.getItem('rules_categories');
      if (saved) {
        setCategories(JSON.parse(saved));
      } else {
        setCategories([
          { id: 'players', label: 'Правила для игроков', icon: 'UserCheck', order: 0 },
          { id: 'factions', label: 'Правила для фракций', icon: 'Shield', order: 1 },
          { id: 'general', label: 'Общие правила', icon: 'AlertTriangle', order: 2 }
        ]);
      }
    };

    const fetchNews = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/f3335412-664a-4023-91a6-5cec4935678b');
        if (response.ok) {
          const data = await response.json();
          setNews(data.news || []);
        }
      } catch (error) {
        console.warn('News fetch failed:', error);
      }
    };

    checkAuth();
    fetchSettings();
    fetchRules();
    loadCategories();
    fetchNews();
    
    const authInterval = setInterval(checkAuth, 5000);
    const settingsInterval = setInterval(fetchSettings, 5000);
    const rulesInterval = setInterval(fetchRules, 30000);
    const categoriesInterval = setInterval(loadCategories, 5000);
    const newsInterval = setInterval(fetchNews, 30000);

    return () => {
      clearInterval(authInterval);
      clearInterval(settingsInterval);
      clearInterval(rulesInterval);
      clearInterval(categoriesInterval);
      clearInterval(newsInterval);
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
          forumLink={settings.forum_link}
        />

        <main className="pt-20">
          <HeroSection 
            serverIp={SERVER_IP}
            onCopyIP={handleCopyIP}
            onConnect={handleConnect}
          />

          <CommunitySection settings={settings} />

          <section id="news" className="py-20 px-4">
            <div className="container mx-auto max-w-6xl">
              <h2 className="text-4xl font-bold text-center mb-12 neon-text">Новости</h2>
              
              {news.length === 0 ? (
                <Card className="bg-black/60 backdrop-blur-md border-primary/30 p-12 text-center">
                  <Icon name="Newspaper" size={64} className="mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400">Новостей пока нет. Следите за обновлениями!</p>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {news.map((item) => (
                    <Card key={item.id} className="bg-black/60 backdrop-blur-md border-primary/30 overflow-hidden hover:border-primary/50 transition-all">
                      {item.image_url && (
                        <img 
                          src={item.image_url} 
                          alt={item.title}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                        <p className="text-gray-400 text-sm mb-4">{item.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.created_at).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section id="help" className="py-20 px-4 bg-black/40">
            <div className="container mx-auto max-w-4xl">
              <h2 className="text-4xl font-bold text-center mb-12 neon-text">Помощь</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-black/60 backdrop-blur-md border-primary/30 p-6">
                  <Icon name="HelpCircle" size={32} className="text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-3">Как начать играть?</h3>
                  <p className="text-gray-400 mb-4">
                    1. Скачайте GTA San Andreas<br/>
                    2. Установите SA-MP клиент<br/>
                    3. Добавьте наш сервер: {SERVER_IP}<br/>
                    4. Подключайтесь и регистрируйтесь!
                  </p>
                </Card>

                <Card className="bg-black/60 backdrop-blur-md border-primary/30 p-6">
                  <Icon name="MessageCircle" size={32} className="text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-3">Нужна помощь?</h3>
                  <p className="text-gray-400 mb-4">
                    Если у вас возникли вопросы или проблемы:<br/>
                    • Задайте вопрос в нашем Discord<br/>
                    • Напишите администрации на форуме<br/>
                    • Используйте команду /ask в игре
                  </p>
                </Card>

                <Card className="bg-black/60 backdrop-blur-md border-primary/30 p-6">
                  <Icon name="Shield" size={32} className="text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-3">Важно знать</h3>
                  <p className="text-gray-400 mb-4">
                    • Читайте правила перед началом игры<br/>
                    • Уважайте других игроков<br/>
                    • Не используйте читы и баги<br/>
                    • Следуйте указаниям администрации
                  </p>
                </Card>

                <Card className="bg-black/60 backdrop-blur-md border-primary/30 p-6">
                  <Icon name="Gift" size={32} className="text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-3">Донат и VIP</h3>
                  <p className="text-gray-400 mb-4">
                    Поддержите проект и получите преимущества:<br/>
                    • Уникальные скины и транспорт<br/>
                    • Дополнительные слоты инвентаря<br/>
                    • Приоритет в очереди на вход
                  </p>
                </Card>
              </div>
            </div>
          </section>

          <section id="rules" className="py-20 px-4">
            <div className="container mx-auto max-w-4xl">
              <h2 className="text-4xl font-bold text-center mb-12 neon-text">Правила сервера</h2>
              
              <div className="space-y-6">
                {categories.sort((a, b) => a.order - b.order).map((category) => {
                  const categoryRules = rules.filter(r => r.category === category.id);
                  if (categoryRules.length === 0) return null;
                  
                  return (
                    <Card key={category.id} className="bg-black/60 backdrop-blur-md border-primary/30 p-6">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Icon name={category.icon} size={24} className="text-primary" />
                        {category.label}
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
            <div className="container mx-auto text-center text-gray-400 text-sm space-y-3">
              <p>© 2023-2026 {serverName}. Все права защищены.</p>
              <p>Постапокалиптический ролевой проект GTA SAMP • Основан в 2023 году</p>
              <div className="pt-3 border-t border-white/5 mt-3">
                <p className="text-gray-500">ИП Бояринцев Вадим Вячеславович</p>
                <p className="text-gray-500">ИНН: 222261894107</p>
              </div>
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