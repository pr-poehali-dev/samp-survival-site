import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";

interface UserData {
  [key: string]: any;
}

interface ProfileGameStatsProps {
  user: UserData;
  formatPlayTime: () => string;
  getKillStats: () => { zombies: number; players: number };
  showDonateModal: boolean;
  donateAmount: string;
  setDonateAmount: (value: string) => void;
  setShowDonateModal: (value: boolean) => void;
  handleDonateSubmit: () => void;
}

export const ProfileGameStats = ({
  user,
  formatPlayTime,
  getKillStats,
  showDonateModal,
  donateAmount,
  setDonateAmount,
  setShowDonateModal,
  handleDonateSubmit
}: ProfileGameStatsProps) => {
  const killStats = getKillStats();

  return (
    <>
      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <Card className="bg-black/60 backdrop-blur-md border-primary/30 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Icon name="Clock" size={24} className="text-blue-500" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Время игры</div>
              <div className="text-xl font-bold">{formatPlayTime()}</div>
            </div>
          </div>
        </Card>

        <Card className="bg-black/60 backdrop-blur-md border-red-500/30 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
              <Icon name="Skull" size={24} className="text-red-500" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Убито зомби</div>
              <div className="text-xl font-bold text-red-500">{killStats.zombies}</div>
            </div>
          </div>
        </Card>

        <Card className="bg-black/60 backdrop-blur-md border-orange-500/30 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
              <Icon name="Crosshair" size={24} className="text-orange-500" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Убито игроков</div>
              <div className="text-xl font-bold text-orange-500">{killStats.players}</div>
            </div>
          </div>
        </Card>
      </div>

      {showDonateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <Card className="bg-black/90 backdrop-blur-md border-primary/30 p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Icon name="DollarSign" size={24} className="text-primary" />
                Пополнение доната
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowDonateModal(false)}
              >
                <Icon name="X" size={20} />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Сумма пополнения (₽)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Введите сумму"
                  value={donateAmount}
                  onChange={(e) => setDonateAmount(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div className="text-sm text-gray-400">
                <p>Для пополнения доната обратитесь к администрации сервера.</p>
                <p className="mt-2">После оплаты средства поступят на ваш счет.</p>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={handleDonateSubmit}
                  className="flex-1 neon-glow"
                >
                  Продолжить
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowDonateModal(false)}
                  className="flex-1"
                >
                  Отмена
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};
