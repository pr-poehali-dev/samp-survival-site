import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface InventoryItem {
  slot: number;
  loot_id: string;
  name: string;
  price: number;
  from_case: boolean;
  can_sell: boolean;
}

const Inventory = () => {
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selling, setSelling] = useState<number | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      toast({
        title: "Требуется авторизация",
        description: "Войдите в систему",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }
    setUser(JSON.parse(userData));
    fetchInventory(JSON.parse(userData).u_id);
  }, [navigate, toast]);

  const fetchInventory = async (userId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`https://functions.poehali.dev/0b0752f6-f615-45ce-91f0-2ce21465d076?user_id=${userId}`);
      const data = await response.json();
      
      if (data.items) {
        setItems(data.items);
      }
    } catch (error) {
      console.error('Failed to load inventory:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить инвентарь",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sellItem = async (item: InventoryItem) => {
    if (!user?.u_id) return;

    setSelling(item.slot);
    
    try {
      const response = await fetch('https://functions.poehali.dev/0b0752f6-f615-45ce-91f0-2ce21465d076', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: user.u_id,
          slot: item.slot
        })
      });

      const data = await response.json();

      if (data.error) {
        toast({
          title: "Ошибка",
          description: data.error,
          variant: "destructive"
        });
        return;
      }

      if (data.success) {
        toast({
          title: "Продано!",
          description: `${data.item_name} продан за ${data.sell_price}₽`,
        });
        
        const updatedUser = { ...user, u_money: (user.u_money || 0) + data.sell_price };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        await fetchInventory(user.u_id);
      }
    } catch (error) {
      console.error('Failed to sell item:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось продать предмет",
        variant: "destructive"
      });
    } finally {
      setSelling(null);
    }
  };

  const extractColor = (name: string): string | null => {
    const match = name.match(/\{([A-F0-9]{6})\}/);
    return match ? `#${match[1]}` : null;
  };

  const cleanItemName = (name: string) => {
    return name.replace(/\{[A-F0-9]{6}\}/g, '');
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: `url('https://cdn.poehali.dev/projects/bb150b69-aa78-47ca-b25a-00871a425db3/files/e11933f8-63f0-48b9-8388-339a50eaaaa6.jpg')` }}
      />
      
      <div className="blood-drip" style={{ left: '12%', top: '0', animationDelay: '0.4s', height: '65px' }} />
      <div className="blood-drip" style={{ left: '28%', top: '0', animationDelay: '1s', height: '80px' }} />
      <div className="blood-drip" style={{ left: '50%', top: '0', animationDelay: '0.6s' }} />
      <div className="blood-drip" style={{ left: '68%', top: '0', animationDelay: '1.4s', height: '70px' }} />
      <div className="blood-drip" style={{ left: '85%', top: '0', animationDelay: '0.9s', height: '90px' }} />
      
      <div className="relative z-10">
        <header className="bg-black/80 backdrop-blur-md border-b border-white/10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="text-2xl font-bold text-gradient">ИНВЕНТАРЬ</div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-black/60 px-4 py-2 rounded-lg border border-green-500/30">
                <Icon name="Wallet" size={18} className="text-green-500" />
                <span className="font-bold text-green-500">{user?.u_money || 0}₽</span>
              </div>
              <div className="flex items-center gap-2 bg-black/60 px-4 py-2 rounded-lg border border-yellow-500/30">
                <Icon name="Gem" size={18} className="text-yellow-500" />
                <span className="font-bold text-yellow-500">{user?.u_donate || 0}Ᵽ</span>
              </div>
              <Button variant="ghost" onClick={() => navigate("/")}>
                <Icon name="Home" size={18} className="mr-2" />
                Главная
              </Button>
              <Button variant="ghost" onClick={() => navigate("/cases")}>
                <Icon name="Package" size={18} className="mr-2" />
                Кейсы
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-black mb-2 neon-text">Ваш инвентарь</h1>
              <p className="text-gray-400">Продавайте предметы из кейсов за 70% стоимости. Выйдите из игры для операций!</p>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto"></div>
                <p className="text-gray-400 mt-4">Загрузка инвентаря...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-20">
                <Icon name="PackageOpen" size={64} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400 text-xl mb-4">Инвентарь пуст</p>
                <Button onClick={() => navigate("/cases")}>
                  <Icon name="Package" size={18} className="mr-2" />
                  Открыть кейс
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {items.map((item) => {
                  const itemColor = extractColor(item.name);
                  return (
                  <Card key={item.slot} className="bg-black/60 backdrop-blur-md border-2 border-green-500/30 p-4 hover:scale-105 transition-transform">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📦</div>
                      <h3 className="text-sm font-bold mb-1 line-clamp-2" style={{ color: itemColor || 'white' }}>
                        {cleanItemName(item.name)}
                      </h3>
                      <p className="text-xs text-gray-400 mb-2">Стоимость: {item.price}₽</p>
                      <p className="text-xs text-green-400 mb-3">Продажа: {Math.floor(item.price * 0.7)}₽</p>
                      {item.can_sell ? (
                        <Button 
                          onClick={() => sellItem(item)}
                          disabled={selling === item.slot}
                          size="sm"
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          {selling === item.slot ? (
                            <>
                              <Icon name="Loader2" size={14} className="mr-2 animate-spin" />
                              Продажа...
                            </>
                          ) : (
                            <>
                              <Icon name="DollarSign" size={14} className="mr-2" />
                              Продать
                            </>
                          )}
                        </Button>
                      ) : (
                        <div className="text-xs text-red-400 text-center py-2 border border-red-500/30 rounded bg-red-950/20">
                          <Icon name="Lock" size={14} className="inline mr-1" />
                          Из игры
                        </div>
                      )}
                    </div>
                  </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Inventory;