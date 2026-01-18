import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { useState } from "react";

const Index = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: `url('https://cdn.poehali.dev/projects/bb150b69-aa78-47ca-b25a-00871a425db3/files/e11933f8-63f0-48b9-8388-339a50eaaaa6.jpg')` }}
      />
      
      <div className="relative z-10">
        <header className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-md border-b border-white/10 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="text-2xl font-bold text-gradient">SURVIVAL RP</div>
            
            <nav className="hidden md:flex items-center gap-6">
              <a href="#news" className="hover:text-primary transition-colors">Новости</a>
              <a href="#howto" className="hover:text-primary transition-colors">Как начать</a>
              <a href="#help" className="hover:text-primary transition-colors">Помощь</a>
              <a href="#forum" className="hover:text-primary transition-colors">Форум</a>
              <a href="#donate" className="hover:text-primary transition-colors">Donate</a>
            </nav>

            <div className="flex items-center gap-4">
              <Button className="hidden md:flex neon-glow">
                <Icon name="User" size={18} className="mr-2" />
                Войти
              </Button>
              
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
                <a href="#howto" className="hover:text-primary transition-colors">Как начать</a>
                <a href="#help" className="hover:text-primary transition-colors">Помощь</a>
                <a href="#forum" className="hover:text-primary transition-colors">Форум</a>
                <a href="#donate" className="hover:text-primary transition-colors">Donate</a>
                <Button className="w-full neon-glow">
                  <Icon name="User" size={18} className="mr-2" />
                  Войти
                </Button>
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
                    <div className="text-2xl font-bold text-primary">46.174.48.50:7788</div>
                  </div>
                  <Button size="lg" className="neon-glow px-8">
                    <Icon name="Wifi" size={20} className="mr-2" />
                    Подключиться
                  </Button>
                </div>
                
                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Онлайн</span>
                    <span className="text-primary">2 / 25</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full" style={{ width: '8%' }} />
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
                  <Button className="w-full neon-glow" size="lg">
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
                  <Button className="w-full neon-glow" size="lg">
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
              <p>© 2026 Survival RP. Все права защищены.</p>
              <p className="mt-2">Постапокалиптический ролевой проект GTA SAMP</p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Index;
