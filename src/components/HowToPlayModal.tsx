import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

interface HowToPlayModalProps {
  showHowToPlay: boolean;
  serverIp: string;
  onClose: () => void;
  onCopyIP: () => void;
}

const HowToPlayModal = ({ showHowToPlay, serverIp, onClose, onCopyIP }: HowToPlayModalProps) => {
  if (!showHowToPlay) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="bg-black/90 border-primary/30 p-6 max-w-2xl w-full my-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Icon name="Gamepad2" size={28} className="text-primary" />
            Как начать играть?
          </h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
          >
            <Icon name="X" size={24} />
          </Button>
        </div>
        
        <div className="space-y-4">
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
            <h4 className="text-lg font-bold mb-2 flex items-center gap-2">
              <span className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-black text-sm font-bold">1</span>
              Скачать GTA San Andreas
            </h4>
            <p className="text-gray-300 text-sm">
              Версия 1.0 (US/EU) без модов • ~3.5 ГБ
            </p>
          </div>

          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
            <h4 className="text-lg font-bold mb-2 flex items-center gap-2">
              <span className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-black text-sm font-bold">2</span>
              Установить SA-MP клиент
            </h4>
            <Button 
              className="w-full neon-glow justify-center mt-2" 
              onClick={() => window.open('https://sa-mp.mp/files/sa-mp-0.3.7-R5-install.exe', '_blank')}
            >
              <Icon name="Download" size={18} className="mr-2" />
              Скачать SA-MP 0.3.7 R5
            </Button>
            <p className="text-gray-400 text-xs mt-2">Укажите папку с GTA SA при установке • 15 МБ</p>
          </div>

          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
            <h4 className="text-lg font-bold mb-2 flex items-center gap-2">
              <span className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-black text-sm font-bold">3</span>
              Подключиться к серверу
            </h4>
            <div 
              className="bg-black/50 border border-primary/50 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-black/70 transition-colors mt-2"
              onClick={onCopyIP}
            >
              <span className="text-xl font-bold text-primary font-mono">{serverIp}</span>
              <Button size="sm" variant="outline" className="border-primary/30">
                <Icon name="Copy" size={14} />
              </Button>
            </div>
            <p className="text-gray-400 text-xs mt-2">SA-MP клиент → Add server → вставьте IP → Connect</p>
          </div>

          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center gap-3">
            <Icon name="Rocket" size={20} className="text-green-500 flex-shrink-0" />
            <p className="text-gray-300 text-sm">
              Создайте аккаунт в игре и начните выживание!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HowToPlayModal;