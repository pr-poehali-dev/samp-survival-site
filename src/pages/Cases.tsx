import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface CaseItem {
  loot_name: string;
  loot_type: number | string;
  loot_price: number;
  loot_quality: number;
}

interface Case {
  id: number;
  name: string;
  price_money: number;
  price_donate: number;
  description: string;
  image: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  items: CaseItem[];
}

const rarityColors = {
  common: 'border-gray-500 bg-gray-500/10',
  uncommon: 'border-green-500 bg-green-500/10',
  rare: 'border-blue-500 bg-blue-500/10',
  legendary: 'border-purple-500 bg-purple-500/10'
};

const Cases = () => {
  const [user, setUser] = useState<any>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(false);
  const [opening, setOpening] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [animationItems, setAnimationItems] = useState<CaseItem[]>([]);
  const [wonItem, setWonItem] = useState<CaseItem | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      toast({
        title: "Требуется авторизация",
        description: "Войдите в систему, чтобы открывать кейсы",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }
    setUser(JSON.parse(userData));
    fetchCases();
  }, [navigate, toast]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://functions.poehali.dev/e9b4f60e-91f5-4a4f-82c0-2d3541751535');
      const data = await response.json();
      
      if (data.cases) {
        setCases(data.cases);
      }
    } catch (error) {
      console.error('Failed to load cases:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить кейсы",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const openCase = async (caseData: Case, paymentMethod: 'money' | 'donate') => {
    if (!user?.u_id) {
      toast({
        title: "Требуется авторизация",
        description: "Войдите в систему, чтобы открывать кейсы",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }

    // Проверяем баланс в зависимости от выбранного способа оплаты
    if (paymentMethod === 'donate' && (user.u_donate || 0) < caseData.price_donate) {
      toast({
        title: "Недостаточно доната",
        description: `Необходимо ${caseData.price_donate}Ᵽ, у вас ${user.u_donate || 0}Ᵽ`,
        variant: "destructive"
      });
      return;
    }

    if (paymentMethod === 'money' && (user.u_money || 0) < caseData.price_money) {
      toast({
        title: "Недостаточно денег",
        description: `Необходимо ${caseData.price_money}₽, у вас ${user.u_money || 0}₽`,
        variant: "destructive"
      });
      return;
    }

    setOpening(true);
    setSelectedCase(caseData);
    setWonItem(null);
    
    try {
      const response = await fetch('https://functions.poehali.dev/e9b4f60e-91f5-4a4f-82c0-2d3541751535', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          case_id: caseData.id,
          user_id: user.u_id,
          payment_method: paymentMethod
        })
      });

      const data = await response.json();

      if (data.error) {
        toast({
          title: "Ошибка",
          description: data.error,
          variant: "destructive"
        });
        setOpening(false);
        setSelectedCase(null);
        return;
      }

      if (data.success) {
        setAnimationItems(data.animation_items);
        setWonItem(data.won_item);
        
        console.log('Animation items length:', data.animation_items.length);
        console.log('Item at position 30:', data.animation_items[30]);
        console.log('Won item:', data.won_item);
        console.log('Items match?', data.animation_items[30]?.loot_name === data.won_item.loot_name);
        
        setTimeout(() => {
          setIsAnimating(true);
          
          setTimeout(() => {
            setIsAnimating(false);
            toast({
              title: "Поздравляем!",
              description: `Вы получили: ${data.won_item.loot_name}`,
            });
            
            const updatedUser = { ...user };
            if (paymentMethod === 'donate') {
              updatedUser.u_donate = (user.u_donate || 0) - caseData.price_donate;
            } else {
              updatedUser.u_money = (user.u_money || 0) - caseData.price_money;
            }
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
          }, 5000);
        }, 100);
      }
    } catch (error) {
      console.error('Failed to open case:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось открыть кейс",
        variant: "destructive"
      });
      setOpening(false);
      setSelectedCase(null);
    }
  };

  const closeAnimation = () => {
    setOpening(false);
    setSelectedCase(null);
    setAnimationItems([]);
    setWonItem(null);
    setIsAnimating(false);
  };

  const cleanItemName = (name: string) => {
    return name.replace(/\{[A-F0-9]{6}\}/g, '');
  };

  const getRarityByPrice = (price: number): string => {
    if (price < 500) return 'common';
    if (price < 2000) return 'uncommon';
    if (price < 5000) return 'rare';
    return 'legendary';
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
            <div className="text-2xl font-bold text-gradient">КЕЙСЫ</div>
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
              <Button variant="ghost" onClick={() => navigate("/inventory")}>
                <Icon name="Package" size={18} className="mr-2" />
                Инвентарь
              </Button>
              <Button variant="ghost" onClick={() => navigate("/profile")}>
                <Icon name="User" size={18} className="mr-2" />
                Профиль
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {opening && selectedCase ? (
            <div className="max-w-6xl mx-auto">
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-black mb-2 neon-text">{selectedCase.name}</h2>
                <p className="text-gray-400">Открытие кейса...</p>
              </div>

              <div className="relative overflow-hidden bg-black/80 backdrop-blur-md border border-primary/30 rounded-lg p-8">
                <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-primary neon-glow z-10" style={{ transform: 'translateX(-50%)' }}></div>
                
                <div 
                  className="flex gap-4 transition-transform duration-[5000ms] ease-out"
                  style={{
                    transform: isAnimating ? 'translateX(calc(50vw - 30 * 144px - 80px))' : 'translateX(0)',
                  }}
                >
                  {animationItems.map((item, index) => {
                    const rarity = getRarityByPrice(item.loot_price);
                    return (
                      <div
                        key={index}
                        className={`flex-shrink-0 w-32 h-40 flex flex-col items-center justify-center border-2 rounded-lg p-3 ${rarityColors[rarity as keyof typeof rarityColors]}`}
                      >
                        <div className="text-4xl mb-2">📦</div>
                        <div className="text-xs text-center font-bold line-clamp-2">{cleanItemName(item.loot_name)}</div>
                        <div className="text-xs text-gray-400 mt-1">{item.loot_price}₽</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {!isAnimating && wonItem && (
                <div className="mt-8 text-center">
                  <Card className={`inline-block bg-black/80 backdrop-blur-md border-2 p-8 ${rarityColors[getRarityByPrice(wonItem.loot_price) as keyof typeof rarityColors]}`}>
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-2xl font-bold mb-2">Вы выиграли!</h3>
                    <p className="text-xl mb-4">{cleanItemName(wonItem.loot_name)}</p>
                    <p className="text-gray-400 mb-4">Стоимость: {wonItem.loot_price}₽</p>
                    <Button onClick={closeAnimation} className="neon-glow">
                      <Icon name="Check" size={18} className="mr-2" />
                      Забрать
                    </Button>
                  </Card>
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <h1 className="text-4xl font-black mb-2 neon-text">Кейсы с предметами</h1>
                <p className="text-gray-400">Открывайте кейсы и получайте ценные предметы для выживания</p>
              </div>

              {loading ? (
                <div className="text-center py-20">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto"></div>
                  <p className="text-gray-400 mt-4">Загрузка кейсов...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {cases.map((caseData) => (
                    <Card key={caseData.id} className={`bg-black/60 backdrop-blur-md border-2 p-6 hover:scale-105 transition-transform cursor-pointer ${rarityColors[caseData.rarity]}`}>
                      <div className="text-center">
                        <div className="text-6xl mb-4">{caseData.image}</div>
                        <h3 className="text-xl font-bold mb-2">{caseData.name}</h3>
                        <p className="text-sm text-gray-400 mb-4 min-h-[40px]">{caseData.description}</p>
                        
                        <div className="text-xs text-gray-500 mb-4 min-h-[20px]">
                          Выберите способ оплаты:
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            onClick={() => openCase(caseData, 'money')}
                            disabled={opening}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <Icon name="Wallet" size={18} className="mr-2" />
                            {caseData.price_money}₽
                          </Button>
                          <Button 
                            onClick={() => openCase(caseData, 'donate')}
                            disabled={opening}
                            className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                          >
                            <Icon name="Gem" size={18} className="mr-2" />
                            {caseData.price_donate}ᴽ
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Cases;