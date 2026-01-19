import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

interface UserData {
  [key: string]: any;
}

interface ProfileStatsCardsProps {
  user: UserData;
  getStatValue: (key: string) => string;
}

export const ProfileStatsCards = ({ user, getStatValue }: ProfileStatsCardsProps) => {
  return (
    <>
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-black/60 backdrop-blur-md border-primary/30 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <Icon name="User" size={32} className="text-primary" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Игрок</div>
              <div className="text-2xl font-bold">{getStatValue('u_name') || getStatValue('username')}</div>
            </div>
          </div>
        </Card>

        <Card className="bg-black/60 backdrop-blur-md border-blue-500/30 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Icon name="TrendingUp" size={32} className="text-blue-500" />
            </div>
            <div>
              <div className="text-sm text-blue-500/70">Уровень</div>
              <div className="text-2xl font-bold text-blue-500">{Math.floor((user?.u_lifegame || 0) / 60 / 60)}</div>
            </div>
          </div>
        </Card>

        <Card className="bg-black/60 backdrop-blur-md border-primary/30 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
              <Icon name="Wallet" size={32} className="text-green-500" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Деньги</div>
              <div className="text-2xl font-bold">{getStatValue('u_money') || getStatValue('money') || '0'}₽</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-black/60 backdrop-blur-md border-yellow-500/30 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <Icon name="Crown" size={32} className="text-yellow-500" />
            </div>
            <div>
              <div className="text-sm text-yellow-500/70">VIP статус</div>
              <div className="text-2xl font-bold text-yellow-500">
                {(user?.u_vip_time || 0) > 0 ? `${Math.ceil((user?.u_vip_time || 0) / 86400)} дн.` : 'Нет'}
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-black/60 backdrop-blur-md border-purple-500/30 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center">
              <Icon name="Zap" size={32} className="text-purple-500" />
            </div>
            <div>
              <div className="text-sm text-purple-500/70">Статус</div>
              <div className="text-xl font-bold text-purple-500">
                {(user?.u_online || 0) === 1 ? '🟢 В игре' : '⚪ Оффлайн'}
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-black/60 backdrop-blur-md border-green-500/30 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
              <Icon name="Gem" size={32} className="text-green-500" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Донат валюта</div>
              <div className="text-2xl font-bold">{getStatValue('u_donate') || '0'}Ᵽ</div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};
