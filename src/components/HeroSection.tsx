import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

interface HeroSectionProps {
  serverIp: string;
  online: { players: number; maxPlayers: number };
  onCopyIP: () => void;
  onConnect: () => void;
}

const HeroSection = ({ serverIp, online, onCopyIP, onConnect }: HeroSectionProps) => {
  return (
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
                onClick={onCopyIP}
                title="Нажмите для копирования"
              >
                {serverIp}
                <Icon name="Copy" size={20} className="text-primary/60" />
              </div>
            </div>
            <Button size="lg" className="neon-glow px-8" onClick={onConnect}>
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
  );
};

export default HeroSection;
