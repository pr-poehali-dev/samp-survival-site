import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

interface UserData {
  [key: string]: any;
}

interface ProfileInfoSectionProps {
  user: UserData;
  getStatValue: (key: string) => string;
  translateField: (key: string) => string;
  formatFieldValue: (key: string, value: any) => string;
  onDonateClick: () => void;
}

export const ProfileInfoSection = ({ 
  user, 
  getStatValue, 
  translateField, 
  formatFieldValue,
  onDonateClick 
}: ProfileInfoSectionProps) => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="bg-black/60 backdrop-blur-md border-primary/30 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Icon name="User" size={24} className="text-primary" />
            Основная информация
          </h2>
          <Button 
            size="sm" 
            onClick={onDonateClick}
            className="neon-glow"
          >
            <Icon name="DollarSign" size={16} className="mr-1" />
            Пополнить
          </Button>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <span className="text-gray-400">Донат</span>
            <span className="font-medium text-white">{getStatValue('u_donate') || '0'}₽</span>
          </div>
          {Object.entries(user)
            .filter(([key]) => 
              !key.toLowerCase().includes('pass') && 
              !key.toLowerCase().includes('password') &&
              key !== 'u_email_status' &&
              key !== 'u_newgame' &&
              key !== 'u_lifetime' &&
              key !== 'u_donate'
            )
            .slice(0, 9)
            .map(([key, value]) => (
              <div key={key} className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-gray-400">{translateField(key)}</span>
                <span className="font-medium text-white">
                  {formatFieldValue(key, value)}
                </span>
              </div>
            ))}
        </div>
      </Card>

      <Card className="bg-black/60 backdrop-blur-md border-green-500/30 p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Icon name="Award" size={24} className="text-green-500" />
          Достижения
        </h2>
        <div className="space-y-4">
          {(() => {
            const achievementData = user?.u_achievement || '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0';
            const achievements = achievementData.split(',').map(Number);
            
            const achievementList = [
              { id: 0, name: 'Первый шаг', desc: 'Зарегистрировался на сервере', icon: 'UserPlus' },
              { id: 1, name: 'Новичок', desc: 'Первый час в игре', icon: 'Clock' },
              { id: 2, name: 'Выживший', desc: 'Прожил 7 дней подряд', icon: 'Trophy' },
              { id: 3, name: 'Охотник на зомби', desc: 'Убил 100 зомби', icon: 'Skull' },
              { id: 4, name: 'Торговец', desc: 'Совершил 50 сделок', icon: 'ShoppingCart' },
              { id: 5, name: 'Богач', desc: 'Накопил 1,000,000₽', icon: 'DollarSign' },
              { id: 6, name: 'Исследователь', desc: 'Посетил все зоны карты', icon: 'Map' },
              { id: 7, name: 'Строитель', desc: 'Построил базу', icon: 'Home' },
              { id: 8, name: 'Командный игрок', desc: 'Вступил в клан', icon: 'Users' },
              { id: 9, name: 'Воин', desc: 'Убил 50 игроков', icon: 'Crosshair' },
              { id: 10, name: 'Лекарь', desc: 'Вылечил 100 раз', icon: 'Heart' },
              { id: 11, name: 'Механик', desc: 'Отремонтировал 100 машин', icon: 'Wrench' },
              { id: 12, name: 'Повар', desc: 'Приготовил 200 блюд', icon: 'Utensils' },
              { id: 13, name: 'Коллекционер', desc: 'Собрал все редкие предметы', icon: 'Package' },
              { id: 14, name: 'Ветеран', desc: 'Играет более года', icon: 'Star' },
              { id: 15, name: 'Легенда', desc: 'Достиг максимального уровня', icon: 'Crown' },
            ];
            
            const unlockedAchievements = achievementList.filter((ach, idx) => achievements[idx] === 1);
            
            if (unlockedAchievements.length === 0) {
              return (
                <div className="text-center p-8 text-gray-500">
                  <Icon name="Award" size={48} className="mx-auto mb-4 text-gray-700" />
                  <p>Пока нет достижений</p>
                  <p className="text-sm mt-2">Играйте на сервере, чтобы получить их!</p>
                </div>
              );
            }
            
            return (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {unlockedAchievements.map((ach) => (
                  <div 
                    key={ach.id} 
                    className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg hover:bg-green-500/20 transition-colors"
                  >
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon name={ach.icon as any} size={20} className="text-green-500" />
                    </div>
                    <div>
                      <div className="font-bold text-white">{ach.name}</div>
                      <div className="text-sm text-gray-400">{ach.desc}</div>
                    </div>
                    <Badge variant="outline" className="ml-auto text-green-500 border-green-500/50">
                      <Icon name="CheckCircle" size={14} className="mr-1" />
                      Получено
                    </Badge>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </Card>
    </div>
  );
};
