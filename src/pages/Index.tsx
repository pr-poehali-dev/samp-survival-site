import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import AdminPanel from '@/components/AdminPanel';

const Index = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [serverName, setServerName] = useState('SAMP SURVIVAL');
  const [onlineCount, setOnlineCount] = useState(847);
  const [isOnlineLoading, setIsOnlineLoading] = useState(false);

  useEffect(() => {
    const fetchOnline = async () => {
      try {
        setIsOnlineLoading(true);
        const response = await fetch('https://functions.poehali.dev/0785d800-5b06-489f-bdd2-3b05aaeca92f');
        const data = await response.json();
        setOnlineCount(data.online);
      } catch (error) {
        console.error('Failed to fetch online count:', error);
      } finally {
        setIsOnlineLoading(false);
      }
    };

    fetchOnline();
    const interval = setInterval(fetchOnline, 30000);

    return () => clearInterval(interval);
  }, []);

  const donateItems = {
    vip: [
      { id: 1, name: 'VIP Bronze', price: 299, benefits: ['x1.5 опыт', 'Цветной ник', 'Спавн техники'] },
      { id: 2, name: 'VIP Silver', price: 599, benefits: ['x2 опыт', 'Уникальные скины', 'Быстрый спавн', 'Приоритет входа'] },
      { id: 3, name: 'VIP Gold', price: 999, benefits: ['x3 опыт', 'Все VIP машины', 'Телепорт', 'Бессмертие 10 мин/день'] },
    ],
    currency: [
      { id: 4, name: '10.000$', price: 99, amount: '10.000' },
      { id: 5, name: '50.000$', price: 399, amount: '50.000' },
      { id: 6, name: '250.000$', price: 1599, amount: '250.000' },
    ],
    items: [
      { id: 7, name: 'Стартовый набор', price: 199, items: ['Deagle', 'M4', 'Аптечки x5'] },
      { id: 8, name: 'Дом у океана', price: 2999, items: ['3-этажный дом', 'Гараж на 4 авто', 'Вертолётная площадка'] },
      { id: 9, name: 'Бизнес-пакет', price: 4999, items: ['АЗС', 'Магазин 24/7', 'Автосалон'] },
    ],
  };

  const topPlayers = [
    { id: 1, name: 'Dimitri_Volkov', level: 128, kills: 2847, deaths: 891 },
    { id: 2, name: 'Ivan_Drago', level: 115, kills: 2543, deaths: 1023 },
    { id: 3, name: 'Sergey_Bratkov', level: 107, kills: 2198, deaths: 956 },
    { id: 4, name: 'Alexey_Morozov', level: 98, kills: 1876, deaths: 834 },
    { id: 5, name: 'Nikolai_Orlov', level: 92, kills: 1654, deaths: 712 },
  ];

  const news = [
    { id: 1, title: 'Новый сезон начался!', date: '01.10.2025', text: 'Запущен 5-й сезон! Новые локации, машины и задания ждут вас!' },
    { id: 2, title: 'Обновление донат-системы', date: '28.09.2025', text: 'Добавлены новые VIP-привилегии и скидки до 30%' },
    { id: 3, title: 'Турнир PvP', date: '25.09.2025', text: 'Приз - 1.000.000$ и Gold VIP на месяц!' },
  ];

  const rules = [
    'Запрещён читерство и использование багов',
    'Уважайте администрацию и других игроков',
    'Запрещён флуд и оскорбления в чате',
    'DM (DeathMatch) только в специальных зонах',
    'Запрещена реклама других серверов',
  ];

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <header className="sticky top-0 z-50 bg-[#202020] border-b border-[#FF6B00]/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 gta-gradient rounded-lg flex items-center justify-center font-bold text-2xl">
                S
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">{serverName}</h1>
                <p className="text-xs text-muted-foreground">IP: 185.169.134.45:7777</p>
              </div>
            </div>
            <nav className="hidden md:flex gap-6">
              {['Главная', 'Правила', 'Донат', 'Рейтинг', 'Новости', 'Форум', 'FAQ'].map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveSection(item.toLowerCase())}
                  className="text-sm font-medium hover:text-primary transition-colors relative group"
                >
                  {item}
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </button>
              ))}
            </nav>
            <Button className="gta-gradient text-white font-bold hover:opacity-90">
              Играть сейчас
            </Button>
          </div>
        </div>
      </header>

      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FF6B00]/10 to-transparent" />
        <div className="absolute inset-0 opacity-10 overflow-hidden">
          <div className="absolute top-0 left-[5%] w-24 h-24 bg-contain bg-no-repeat opacity-70" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ctext y=%22.9em%22 font-size=%2290%22%3E🧟%3C/text%3E%3C/svg%3E')"}} />
          <div className="absolute top-[15%] left-[25%] w-20 h-20 bg-contain bg-no-repeat opacity-60 animate-pulse" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ctext y=%22.9em%22 font-size=%2290%22%3E🧟‍♂️%3C/text%3E%3C/svg%3E')"}} />
          <div className="absolute top-[10%] right-[15%] w-28 h-28 bg-contain bg-no-repeat opacity-50" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ctext y=%22.9em%22 font-size=%2290%22%3E🧟‍♀️%3C/text%3E%3C/svg%3E')"}} />
          <div className="absolute top-[5%] right-[5%] w-16 h-16 bg-contain bg-no-repeat opacity-70 animate-pulse delay-100" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ctext y=%22.9em%22 font-size=%2290%22%3E🧟%3C/text%3E%3C/svg%3E')"}} />
          <div className="absolute top-[30%] left-[15%] w-20 h-20 bg-contain bg-no-repeat opacity-60" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ctext y=%22.9em%22 font-size=%2290%22%3E🧟‍♂️%3C/text%3E%3C/svg%3E')"}} />
          <div className="absolute top-[25%] right-[30%] w-24 h-24 bg-contain bg-no-repeat opacity-50 animate-pulse delay-200" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ctext y=%22.9em%22 font-size=%2290%22%3E🧟‍♀️%3C/text%3E%3C/svg%3E')"}} />
          <div className="absolute top-[20%] left-[45%] w-16 h-16 bg-contain bg-no-repeat opacity-70" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ctext y=%22.9em%22 font-size=%2290%22%3E🧟%3C/text%3E%3C/svg%3E')"}} />
          <div className="absolute top-[35%] right-[20%] w-20 h-20 bg-contain bg-no-repeat opacity-60 animate-pulse delay-300" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ctext y=%22.9em%22 font-size=%2290%22%3E🧟‍♂️%3C/text%3E%3C/svg%3E')"}} />
        </div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4 gta-gradient text-white border-0">
              <Icon name="Users" size={16} className="mr-2" />
              Онлайн: {onlineCount} {isOnlineLoading && '⟳'} игроков
            </Badge>
            <h2 className="text-5xl md:text-7xl font-black mb-6 text-gradient">
              {serverName}
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Выживай в жестоком мире GTA San Andreas. Создавай банды, захватывай территории, зарабатывай деньги и становись легендой улиц!
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" className="gta-gradient text-white font-bold text-lg px-8">
                <Icon name="Gamepad2" size={20} className="mr-2" />
                Начать играть
              </Button>
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white font-bold text-lg px-8">
                <Icon name="Youtube" size={20} className="mr-2" />
                Трейлер
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <Card className="bg-[#202020] border-[#FF6B00]/20 hover:border-[#FF6B00] transition-all hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 gta-gradient rounded-lg flex items-center justify-center mb-4">
                  <Icon name="Trophy" size={24} className="text-white" />
                </div>
                <CardTitle>Рейтинговая система</CardTitle>
                <CardDescription>Соревнуйся с лучшими игроками сервера</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-[#202020] border-[#FF6B00]/20 hover:border-[#FF6B00] transition-all hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 gta-gradient rounded-lg flex items-center justify-center mb-4">
                  <Icon name="Coins" size={24} className="text-white" />
                </div>
                <CardTitle>Экономика</CardTitle>
                <CardDescription>Зарабатывай, торгуй, инвестируй в бизнесы</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-[#202020] border-[#FF6B00]/20 hover:border-[#FF6B00] transition-all hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 gta-gradient rounded-lg flex items-center justify-center mb-4">
                  <Icon name="Sword" size={24} className="text-white" />
                </div>
                <CardTitle>Банды и PvP</CardTitle>
                <CardDescription>Создавай банду и захватывай территории</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#202020]/50">
        <div className="container mx-auto px-4">
          <h3 className="text-4xl font-bold text-center mb-12 text-gradient">Донат-магазин</h3>
          <Tabs defaultValue="vip" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 bg-[#202020]">
              <TabsTrigger value="vip">VIP статусы</TabsTrigger>
              <TabsTrigger value="currency">Валюта</TabsTrigger>
              <TabsTrigger value="items">Предметы</TabsTrigger>
            </TabsList>
            <TabsContent value="vip" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {donateItems.vip.map((item, index) => (
                  <Card key={item.id} className={`bg-[#202020] border-2 transition-all hover:scale-105 ${index === 2 ? 'border-[#FFD700]' : 'border-[#FF6B00]/20'}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-2xl">{item.name}</CardTitle>
                        {index === 2 && <Badge className="gta-gradient text-white border-0">Популярный</Badge>}
                      </div>
                      <CardDescription className="text-3xl font-bold text-primary">{item.price} ₽</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 mb-6">
                        {item.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <Icon name="Check" size={16} className="text-primary" />
                            <span className="text-sm">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full gta-gradient text-white font-bold hover:opacity-90">
                        Купить
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="currency" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {donateItems.currency.map((item) => (
                  <Card key={item.id} className="bg-[#202020] border-[#FF6B00]/20 hover:border-[#FF6B00] transition-all hover:scale-105">
                    <CardHeader>
                      <CardTitle className="text-2xl">{item.name}</CardTitle>
                      <CardDescription className="text-3xl font-bold text-primary">{item.price} ₽</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-6">
                        <Icon name="Coins" size={24} className="text-[#FFD700]" />
                        <span className="text-xl font-bold">{item.amount} игровых долларов</span>
                      </div>
                      <Button className="w-full gta-gradient text-white font-bold hover:opacity-90">
                        Купить
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="items" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {donateItems.items.map((item) => (
                  <Card key={item.id} className="bg-[#202020] border-[#FF6B00]/20 hover:border-[#FF6B00] transition-all hover:scale-105">
                    <CardHeader>
                      <CardTitle className="text-xl">{item.name}</CardTitle>
                      <CardDescription className="text-3xl font-bold text-primary">{item.price} ₽</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 mb-6">
                        {item.items.map((i, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <Icon name="Package" size={16} className="text-primary" />
                            <span className="text-sm">{i}</span>
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full gta-gradient text-white font-bold hover:opacity-90">
                        Купить
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-4xl font-bold text-center mb-12 text-gradient">Топ игроков</h3>
          <div className="max-w-4xl mx-auto space-y-4">
            {topPlayers.map((player, index) => (
              <Card key={player.id} className="bg-[#202020] border-[#FF6B00]/20 hover:border-[#FF6B00] transition-all hover:scale-102">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    <div className={`text-4xl font-black ${index === 0 ? 'text-[#FFD700]' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-[#CD7F32]' : 'text-muted-foreground'}`}>
                      #{index + 1}
                    </div>
                    <Avatar className="w-16 h-16 border-2 border-primary">
                      <AvatarFallback className="bg-gradient-to-br from-[#FF6B00] to-[#FFD700] text-white font-bold text-xl">
                        {player.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold mb-1">{player.name}</h4>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Icon name="Star" size={14} className="text-[#FFD700]" />
                          Уровень {player.level}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="Skull" size={14} className="text-red-500" />
                          {player.kills} убийств
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="TrendingUp" size={14} className="text-green-500" />
                          K/D: {(player.kills / player.deaths).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <Badge className="gta-gradient text-white border-0 text-lg px-4 py-2">
                      {player.level} lvl
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#202020]/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div>
              <h3 className="text-3xl font-bold mb-6 text-gradient">Последние новости</h3>
              <div className="space-y-4">
                {news.map((item) => (
                  <Card key={item.id} className="bg-[#202020] border-[#FF6B00]/20 hover:border-[#FF6B00] transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <Badge variant="outline" className="border-primary text-primary">
                          {item.date}
                        </Badge>
                      </div>
                      <CardDescription>{item.text}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-3xl font-bold mb-6 text-gradient">Правила сервера</h3>
              <Card className="bg-[#202020] border-[#FF6B00]/20">
                <CardContent className="p-6">
                  <ul className="space-y-4">
                    {rules.map((rule, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full gta-gradient flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-white text-xs font-bold">{index + 1}</span>
                        </div>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full mt-6 border-primary text-primary hover:bg-primary hover:text-white">
                    Читать полные правила
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#202020] border-t border-[#FF6B00]/20 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold text-lg mb-4 text-gradient">SAMP SURVIVAL</h4>
              <p className="text-sm text-muted-foreground">Лучший SAMP сервер в СНГ. Играй, развивайся, побеждай!</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Навигация</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Главная</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Правила</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Форум</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Поддержка</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Помощь</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Банлист</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Присоединяйся</h4>
              <div className="flex gap-3">
                <Button size="icon" variant="outline" className="border-primary hover:bg-primary hover:text-white">
                  <Icon name="MessageCircle" size={20} />
                </Button>
                <Button size="icon" variant="outline" className="border-primary hover:bg-primary hover:text-white">
                  <Icon name="Users" size={20} />
                </Button>
                <Button size="icon" variant="outline" className="border-primary hover:bg-primary hover:text-white">
                  <Icon name="Youtube" size={20} />
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t border-[#FF6B00]/20 mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2025 SAMP SURVIVAL. Все права защищены.
          </div>
        </div>
      </footer>
      
      <AdminPanel serverName={serverName} onServerNameChange={setServerName} />
    </div>
  );
};

export default Index;