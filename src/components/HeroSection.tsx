import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";

interface HeroSectionProps {
  serverIp: string;
  onCopyIP: () => void;
  onConnect: () => void;
}

const HeroSection = ({ serverIp, onCopyIP, onConnect }: HeroSectionProps) => {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen flex items-center justify-center px-4 relative">
      <div 
        className="absolute inset-0 opacity-20 bg-cover bg-center"
        style={{ backgroundImage: "url('https://cdn.poehali.dev/projects/bb150b69-aa78-47ca-b25a-00871a425db3/files/e11933f8-63f0-48b9-8388-339a50eaaaa6.jpg')" }}
      />
      <div className="text-center max-w-4xl mx-auto relative z-10">
        <h1 className="text-5xl md:text-7xl font-black mb-6 neon-text glitch">
          НОВАЯ КРЕПОСТЬ
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 fade-pulse">
          Постапокалиптическая пустошь
        </p>
        
        <Card className="bg-black/60 backdrop-blur-md border-primary/30 p-8 mb-8 horror-glow">
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
            <div className="flex gap-3">
              <Button size="lg" className="neon-glow px-8" onClick={onConnect}>
                <Icon name="Wifi" size={20} className="mr-2" />
                Подключиться
              </Button>
              <Button size="lg" variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/10" onClick={() => navigate('/cases')}>
                <Icon name="Gift" size={20} className="mr-2" />
                Кейсы
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-black/40 backdrop-blur-md border-primary/20 p-6 hover:border-primary/50 hover:horror-glow transition-all">
            <Icon name="Skull" size={40} className="mx-auto mb-4 text-primary animate-pulse" />
            <h3 className="font-bold mb-2">Зомби</h3>
            <p className="text-sm text-gray-400">Сражайся с ордами зомби и защищай своё убежище</p>
          </Card>

          <Card className="bg-black/40 backdrop-blur-md border-primary/20 p-6 hover:border-primary/50 hover:horror-glow transition-all">
            <Icon name="Users" size={40} className="mx-auto mb-4 text-primary animate-pulse" />
            <h3 className="font-bold mb-2">Кланы</h3>
            <p className="text-sm text-gray-400">Объединяйся с друзьями и захватывай территории</p>
          </Card>

          <Card className="bg-black/40 backdrop-blur-md border-primary/20 p-6 hover:border-primary/50 hover:horror-glow transition-all">
            <Icon name="Crosshair" size={40} className="mx-auto mb-4 text-primary animate-pulse" />
            <h3 className="font-bold mb-2">Оружие</h3>
            <p className="text-sm text-gray-400">Огромный арсенал оружия для выживания</p>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;