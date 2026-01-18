import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [online, setOnline] = useState({ players: 0, maxPlayers: 100 });
  const [serverName, setServerName] = useState(() => {
    return localStorage.getItem('cached_server_name') || 'SURVIVAL RP';
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [settings, setSettings] = useState(() => {
    const cached = localStorage.getItem('cached_settings');
    return cached ? JSON.parse(cached) : { discord_link: '', vk_link: '', forum_link: '' };
  });
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
        localStorage.setItem('cached_online', JSON.stringify(newOnline));
      } catch (error) {
        console.error('Failed to fetch online:', error);
        const cached = localStorage.getItem('cached_online');
        if (cached) {
          setOnline(JSON.parse(cached));
        }
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
          localStorage.setItem('cached_server_name', data.server_name);
        }
        
        const newSettings = {
          discord_link: data.discord_link || settings.discord_link,
          vk_link: data.vk_link || settings.vk_link,
          forum_link: data.forum_link || settings.forum_link
        };
        
        setSettings(newSettings);
        localStorage.setItem('cached_settings', JSON.stringify(newSettings));
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };

    const cachedOnline = localStorage.getItem('cached_online');
    if (cachedOnline) {
      setOnline(JSON.parse(cachedOnline));
    }
    
    checkAuth();
    fetchOnline();
    fetchSettings();
    
    const authInterval = setInterval(checkAuth, 5000);
    const onlineInterval = setInterval(fetchOnline, 30000);
    const settingsInterval = setInterval(fetchSettings, 60000);

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
        <header className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-md border-b border-white/10 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="text-2xl font-bold text-gradient">{serverName}</div>
            
            <nav className="hidden md:flex items-center gap-6">
              <a href="#news" className="hover:text-primary transition-colors">Новости</a>
              <button onClick={() => setShowHowToPlay(true)} className="hover:text-primary transition-colors">Как начать</button>
              <a href="#help" className="hover:text-primary transition-colors">Помощь</a>
              <a href="#forum" className="hover:text-primary transition-colors">Форум</a>
              <a href="#donate" className="hover:text-primary transition-colors">Донат</a>
            </nav>

            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <Button className="hidden md:flex neon-glow" onClick={() => navigate('/profile')}>
                  <Icon name="User" size={18} className="mr-2" />
                  Профиль
                </Button>
              ) : (
                <Button className="hidden md:flex neon-glow" onClick={() => navigate('/login')}>
                  <Icon name="User" size={18} className="mr-2" />
                  Войти
                </Button>
              )}
              
              <button 
                className="md:hidden text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Icon name={mobileMenuOpen ? "X" : "Menu"} size={24} />
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden bg-black/95 border-t border-white/10">
              <nav className="flex flex-col p-4 gap-4">
                <a href="#news" className="hover:text-primary transition-colors">Новости</a>
                <button onClick={() => setShowHowToPlay(true)} className="hover:text-primary transition-colors text-left">Как начать</button>
                <a href="#help" className="hover:text-primary transition-colors">Помощь</a>
                <a href="#forum" className="hover:text-primary transition-colors">Форум</a>
                <a href="#donate" className="hover:text-primary transition-colors">Донат</a>
                {isLoggedIn ? (
                  <Button className="w-full neon-glow" onClick={() => navigate('/profile')}>
                    <Icon name="User" size={18} className="mr-2" />
                    Профиль
                  </Button>
                ) : (
                  <Button className="w-full neon-glow" onClick={() => navigate('/login')}>
                    <Icon name="User" size={18} className="mr-2" />
                    Войти
                  </Button>
                )}
              </nav>
            </div>
          )}
        </header>

        <main className="pt-20">
          <section className="min-h-screen flex items-center justify-center px-4">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-black mb-6 neon-text">
                НОВАЯ КРЕПОСТЬ
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8">
                Постапокалиптическая пустошь
              </p>
              
              <Card className="bg-black/60 backdrop-blur-md border-primary/30 p-8 mb-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-left">
                    <div className="text-sm text-gray-400 mb-2">IP сервера</div>
                    <div 
                      className="text-2xl font-bold text-primary cursor-pointer hover:text-primary/80 transition-colors flex items-center gap-2"
                      onClick={handleCopyIP}
                      title="Нажмите для копирования"
                    >
                      {SERVER_IP}
                      <Icon name="Copy" size={20} className="text-primary/60" />
                    </div>
                  </div>
                  <Button size="lg" className="neon-glow px-8" onClick={handleConnect}>
                    <Icon name="Wifi" size={20} className="mr-2" />
                    Подключиться
                  </Button>
                </div>
                
                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Онлайн</span>
                    <span className="text-primary">{online.players} / {online.maxPlayers}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all" 
                      style={{ width: `${Math.min((online.players / online.maxPlayers) * 100, 100)}%` }} 
                    />
                  </div>
                </div>
              </Card>

              <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-black/40 backdrop-blur-md border-primary/20 p-6 hover:border-primary/50 transition-all">
                  <Icon name="Skull" size={40} className="mx-auto mb-4 text-primary" />
                  <h3 className="font-bold mb-2">Зомби</h3>
                  <p className="text-sm text-gray-400">Сражайся с ордами зомби и защищай своё убежище</p>
                </Card>

                <Card className="bg-black/40 backdrop-blur-md border-primary/20 p-6 hover:border-primary/50 transition-all">
                  <Icon name="Users" size={40} className="mx-auto mb-4 text-primary" />
                  <h3 className="font-bold mb-2">Кланы</h3>
                  <p className="text-sm text-gray-400">Объединяйся с друзьями и захватывай территории</p>
                </Card>

                <Card className="bg-black/40 backdrop-blur-md border-primary/20 p-6 hover:border-primary/50 transition-all">
                  <Icon name="Crosshair" size={40} className="mx-auto mb-4 text-primary" />
                  <h3 className="font-bold mb-2">Оружие</h3>
                  <p className="text-sm text-gray-400">Огромный арсенал оружия для выживания</p>
                </Card>
              </div>
            </div>
          </section>

          <section id="community" className="py-20 px-4">
            <div className="container mx-auto max-w-6xl">
              <h2 className="text-4xl font-bold text-center mb-12 neon-text">Наше сообщество</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="bg-black/60 backdrop-blur-md border-primary/30 p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-[#5865F2] rounded-full flex items-center justify-center">
                      <Icon name="MessageCircle" size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Discord</h3>
                      <p className="text-gray-400">3 онлайн • 34 участников</p>
                    </div>
                  </div>
                  <Button 
                    className="w-full neon-glow" 
                    size="lg"
                    onClick={() => settings.discord_link && window.open(settings.discord_link, '_blank')}
                    disabled={!settings.discord_link}
                  >
                    Присоединиться к Discord
                  </Button>
                </Card>

                <Card className="bg-black/60 backdrop-blur-md border-primary/30 p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-[#0077FF] rounded-full flex items-center justify-center">
                      <Icon name="Users" size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">VKontakte</h3>
                      <p className="text-gray-400">149 участников</p>
                    </div>
                  </div>
                  <Button 
                    className="w-full neon-glow" 
                    size="lg"
                    onClick={() => settings.vk_link && window.open(settings.vk_link, '_blank')}
                    disabled={!settings.vk_link}
                  >
                    Подписаться ВКонтакте
                  </Button>
                </Card>
              </div>
            </div>
          </section>

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

      {showHowToPlay && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <Card className="bg-black/90 border-primary/30 p-8 max-w-3xl w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-3xl font-bold flex items-center gap-2">
                <Icon name="Gamepad2" size={32} className="text-primary" />
                Как начать играть?
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowHowToPlay(false)}
              >
                <Icon name="X" size={24} />
              </Button>
            </div>
            
            <div className="space-y-6">
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-6">
                <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-black font-bold">1</span>
                  Скачать GTA San Andreas
                </h4>
                <p className="text-gray-300 mb-3">
                  Если у вас ещё нет GTA San Andreas, скачайте чистую версию игры (без модов).
                </p>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li className="flex items-start gap-2">
                    <Icon name="Download" size={16} className="text-primary mt-1" />
                    <span>Рекомендуем версию 1.0 (US/EU) - она лучше всего работает с SA-MP</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="AlertCircle" size={16} className="text-yellow-500 mt-1" />
                    <span>Размер игры: около 3.5 ГБ</span>
                  </li>
                </ul>
              </div>

              <div className="bg-primary/10 border border-primary/30 rounded-lg p-6">
                <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-black font-bold">2</span>
                  Установить SA-MP клиент
                </h4>
                <p className="text-gray-300 mb-3">
                  SA-MP (San Andreas Multiplayer) - мультиплеер-мод для GTA San Andreas.
                </p>
                <div className="space-y-3">
                  <Button 
                    className="w-full neon-glow justify-start" 
                    size="lg"
                    onClick={() => window.open('https://sa-mp.mp/files/sa-mp-0.3.7-R5-install.exe', '_blank')}
                  >
                    <Icon name="Download" size={20} className="mr-2" />
                    Скачать SA-MP 0.3.7 R5 (Официальный сайт)
                  </Button>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li className="flex items-start gap-2">
                      <Icon name="CheckCircle" size={16} className="text-green-500 mt-1" />
                      <span>Запустите установщик и укажите папку с GTA San Andreas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="CheckCircle" size={16} className="text-green-500 mt-1" />
                      <span>Размер: 15 МБ</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-primary/10 border border-primary/30 rounded-lg p-6">
                <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-black font-bold">3</span>
                  Подключиться к серверу
                </h4>
                <div className="space-y-3">
                  <p className="text-gray-300">IP сервера:</p>
                  <div 
                    className="bg-black/50 border border-primary/50 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-black/70 transition-colors"
                    onClick={handleCopyIP}
                  >
                    <span className="text-2xl font-bold text-primary font-mono">{SERVER_IP}</span>
                    <Button size="sm" variant="outline" className="border-primary/30">
                      <Icon name="Copy" size={16} className="mr-2" />
                      Копировать
                    </Button>
                  </div>
                  <ul className="space-y-2 text-gray-400 text-sm mt-4">
                    <li className="flex items-start gap-2">
                      <Icon name="Mouse" size={16} className="text-primary mt-1" />
                      <span>Откройте SA-MP клиент → Add server → вставьте IP → Connect</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="Zap" size={16} className="text-primary mt-1" />
                      <span>Или нажмите кнопку "Подключиться" на главной странице</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
                <h4 className="text-xl font-bold mb-3 flex items-center gap-2 text-green-500">
                  <Icon name="Rocket" size={24} />
                  Готово к игре!
                </h4>
                <p className="text-gray-300">
                  Теперь вы можете создать аккаунт прямо в игре и начать выживание в постапокалиптическом мире. Удачи!
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Index;