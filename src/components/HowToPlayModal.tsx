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
      <Card className="bg-black/90 border-primary/30 p-8 max-w-3xl w-full my-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-3xl font-bold flex items-center gap-2">
            <Icon name="Gamepad2" size={32} className="text-primary" />
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
                onClick={onCopyIP}
              >
                <span className="text-2xl font-bold text-primary font-mono">{serverIp}</span>
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
  );
};

export default HowToPlayModal;
