import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverName, setServerName] = useState('SURVIVAL RP');
  const [blocked, setBlocked] = useState(false);
  const [blockMessage, setBlockMessage] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkBlock = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/56f6b297-dc8f-4b8c-915b-e0291dc4267a', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'check_block' })
        });
        const data = await response.json();
        
        if (data.blocked) {
          setBlocked(true);
          setBlockMessage(data.message || 'Доступ заблокирован');
        }
      } catch (error) {
        console.error('Failed to check IP block:', error);
      }
    };

    const fetchSettings = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/7429a9b5-8d13-44b6-8a20-67ccba23e8f8', {
          signal: AbortSignal.timeout(5000)
        });
        
        if (!response.ok) {
          console.warn(`Settings API returned ${response.status}`);
          return;
        }
        
        const data = await response.json();
        
        if (data.server_name) {
          setServerName(data.server_name);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };

    checkBlock();
    fetchSettings();
    const interval = setInterval(fetchSettings, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (blocked) {
      toast({
        title: "Доступ заблокирован",
        description: blockMessage,
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch("https://functions.poehali.dev/572ddbde-507d-4153-9d42-b66188affb54", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ login, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await fetch('https://functions.poehali.dev/56f6b297-dc8f-4b8c-915b-e0291dc4267a', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'record_attempt', success: true })
        });
        
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("user_password", password);
        localStorage.setItem("login_time", Date.now().toString());
        toast({
          title: "Успешный вход!",
          description: `Добро пожаловать, ${login}`,
        });
        navigate("/profile");
      } else {
        const attemptResponse = await fetch('https://functions.poehali.dev/56f6b297-dc8f-4b8c-915b-e0291dc4267a', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'record_attempt', success: false })
        });
        
        const attemptData = await attemptResponse.json();
        
        if (attemptData.blocked) {
          setBlocked(true);
          setBlockMessage(attemptData.message);
          toast({
            title: "Доступ заблокирован",
            description: attemptData.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Ошибка входа",
            description: data.error || `Неверный логин или пароль. Осталось попыток: ${attemptData.remaining || 0}`,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось подключиться к серверу",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 overflow-hidden">
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: `url('https://cdn.poehali.dev/projects/bb150b69-aa78-47ca-b25a-00871a425db3/files/e11933f8-63f0-48b9-8388-339a50eaaaa6.jpg')` }}
      />
      
      <div className="blood-drip" style={{ left: '8%', top: '0', animationDelay: '0.3s', height: '70px' }} />
      <div className="blood-drip" style={{ left: '22%', top: '0', animationDelay: '0.9s', height: '85px' }} />
      <div className="blood-drip" style={{ left: '42%', top: '0', animationDelay: '0.5s' }} />
      <div className="blood-drip" style={{ left: '65%', top: '0', animationDelay: '1.3s', height: '75px' }} />
      <div className="blood-drip" style={{ left: '82%', top: '0', animationDelay: '0.7s', height: '90px' }} />
      <div className="blood-drip" style={{ left: '95%', top: '0', animationDelay: '1.6s', height: '65px' }} />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black mb-2 text-gradient neon-text">{serverName}</h1>
          <p className="text-gray-400">Вход в личный кабинет</p>
        </div>

        <Card className="bg-black/80 backdrop-blur-md border-primary/30 p-8">
          {blocked && (
            <div className="mb-6 p-4 bg-destructive/20 border border-destructive/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Icon name="ShieldAlert" size={24} className="text-destructive" />
                <div>
                  <h3 className="font-bold text-destructive">Доступ заблокирован</h3>
                  <p className="text-sm text-gray-300">{blockMessage}</p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Логин</label>
              <Input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="Введите ваш логин"
                className="bg-black/50 border-primary/30 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Пароль</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите ваш пароль"
                className="bg-black/50 border-primary/30 text-white"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full neon-glow" 
              size="lg"
              disabled={loading || blocked}
            >
              {loading ? (
                <>
                  <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                  Вход...
                </>
              ) : (
                <>
                  <Icon name="LogIn" size={20} className="mr-2" />
                  Войти
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
              className="text-primary hover:text-primary/80"
            >
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Вернуться на главную
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;