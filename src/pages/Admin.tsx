import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import UsersManagement from "@/components/UsersManagement";
import LogsViewer from "@/components/LogsViewer";
import RulesManagement from "@/components/RulesManagement";
import CasesManagement from "@/components/CasesManagement";
import BlockedIPsManagement from "@/components/BlockedIPsManagement";

interface ServerSettings {
  server_name: string;
  discord_link: string;
  vk_link: string;
  forum_link: string;
}

const Admin = () => {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'settings' | 'users' | 'logs' | 'rules' | 'cases' | 'blocked'>('settings');
  const [settings, setSettings] = useState<ServerSettings>({
    server_name: "Дозор Смерти / Death Watch",
    discord_link: "",
    vk_link: "",
    forum_link: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    console.log('=== ADMIN CHECK DEBUG ===');
    console.log('Full user data:', parsedUser);
    console.log('All user keys:', Object.keys(parsedUser));
    console.log('u_id:', parsedUser?.u_id);
    console.log('id:', parsedUser?.id);
    console.log('admin_level value:', parsedUser?.admin_level);
    console.log('admin_level type:', typeof parsedUser?.admin_level);
    console.log('u_admin value:', parsedUser?.u_admin);
    console.log('user_admin value:', parsedUser?.user_admin);
    
    const adminLevel = parsedUser?.admin_level || 0;
    console.log('Final adminLevel:', adminLevel, 'Type:', typeof adminLevel);
    console.log('Check result:', Number(adminLevel) >= 6 ? 'PASS' : 'FAIL');
    console.log('User ID for cases:', parsedUser?.u_id || parsedUser?.id || 0);
    console.log('========================');
    
    if (Number(adminLevel) < 6) {
      toast({
        title: "Доступ запрещён",
        description: `Требуется уровень админки 6+ (текущий: ${adminLevel})`,
        variant: "destructive",
      });
      navigate("/profile");
      return;
    }
    
    fetchSettings();
    const settingsInterval = setInterval(fetchSettings, 5000);
    return () => clearInterval(settingsInterval);
  }, [navigate, toast]);

  const fetchSettings = async (retryCount = 0) => {
    try {
      const response = await fetch("https://functions.poehali.dev/7429a9b5-8d13-44b6-8a20-67ccba23e8f8", {
        signal: AbortSignal.timeout(8000),
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        console.warn(`Settings API returned ${response.status}`);
        if (retryCount < 2) {
          setTimeout(() => fetchSettings(retryCount + 1), 2000);
        }
        return;
      }
      
      const data = await response.json();
      setSettings({
        server_name: data.server_name || 'Дозор Смерти / Death Watch',
        discord_link: data.discord_link || '',
        vk_link: data.vk_link || '',
        forum_link: data.forum_link || ''
      });
    } catch (error) {
      console.warn('Settings fetch failed, using defaults:', error);
      if (retryCount < 2) {
        setTimeout(() => fetchSettings(retryCount + 1), 2000);
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const username = user?.u_name || user?.username;
      const payload = {
        username: username,
        settings: settings,
      };
      
      console.log('=== SAVE SETTINGS DEBUG ===');
      console.log('Username:', username);
      console.log('Settings:', settings);
      console.log('Payload:', payload);
      console.log('===========================');
      
      const response = await fetch("https://functions.poehali.dev/7429a9b5-8d13-44b6-8a20-67ccba23e8f8", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000)
      });

      const data = await response.json();
      console.log('Response status:', response.status);
      console.log('Response data:', data);

      if (response.ok && data.success) {
        toast({
          title: "Успешно!",
          description: "Настройки сохранены и синхронизированы",
        });
        
        await fetchSettings();
      } else {
        toast({
          title: "Ошибка",
          description: data.error || "Не удалось сохранить",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось подключиться к серверу",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("user_password");
    localStorage.removeItem("login_time");
    navigate("/");
  };

  if (!user) {
    return null;
  }

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
            <div className="text-2xl font-bold text-gradient neon-text">{settings.server_name || 'Дозор Смерти / Death Watch'}</div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/")}>
                <Icon name="Home" size={18} className="mr-2" />
                Главная
              </Button>
              <Button variant="ghost" onClick={() => navigate("/profile")}>
                <Icon name="User" size={18} className="mr-2" />
                Профиль
              </Button>
              <Button variant="outline" onClick={handleLogout} className="border-primary/30">
                <Icon name="LogOut" size={18} className="mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-black mb-2 neon-text">Админ-панель</h1>
              <p className="text-gray-400">Управление настройками сервера</p>
            </div>

            <div className="flex gap-2 mb-6">
              <Button
                onClick={() => setActiveTab('settings')}
                variant={activeTab === 'settings' ? 'default' : 'outline'}
                className={activeTab === 'settings' ? 'neon-glow' : ''}
              >
                <Icon name="Settings" size={18} className="mr-2" />
                Настройки
              </Button>
              <Button
                onClick={() => setActiveTab('users')}
                variant={activeTab === 'users' ? 'default' : 'outline'}
                className={activeTab === 'users' ? 'neon-glow' : ''}
              >
                <Icon name="Users" size={18} className="mr-2" />
                Пользователи (100)
              </Button>
              <Button
                onClick={() => setActiveTab('logs')}
                variant={activeTab === 'logs' ? 'default' : 'outline'}
                className={activeTab === 'logs' ? 'neon-glow' : ''}
              >
                <Icon name="FileText" size={18} className="mr-2" />
                Логи
              </Button>
              <Button
                onClick={() => setActiveTab('rules')}
                variant={activeTab === 'rules' ? 'default' : 'outline'}
                className={activeTab === 'rules' ? 'neon-glow' : ''}
              >
                <Icon name="BookOpen" size={18} className="mr-2" />
                Правила
              </Button>
              <Button
                onClick={() => setActiveTab('cases')}
                variant={activeTab === 'cases' ? 'default' : 'outline'}
                className={activeTab === 'cases' ? 'neon-glow' : ''}
              >
                <Icon name="Gift" size={18} className="mr-2" />
                Кейсы
              </Button>
              <Button
                onClick={() => setActiveTab('blocked')}
                variant={activeTab === 'blocked' ? 'default' : 'outline'}
                className={activeTab === 'blocked' ? 'neon-glow' : ''}
              >
                <Icon name="ShieldAlert" size={18} className="mr-2" />
                Блокировки IP
              </Button>
            </div>

            {activeTab === 'settings' && (
              <>
                <Card className="bg-black/60 backdrop-blur-md border-primary/30 p-8">
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="server_name" className="text-white mb-2 block">
                        Название сервера
                      </Label>
                      <Input
                        id="server_name"
                        value={settings.server_name}
                        onChange={(e) => setSettings({ ...settings, server_name: e.target.value })}
                        className="bg-black/50 border-primary/30 text-white"
                        placeholder="Дозор Смерти / Death Watch"
                      />
                    </div>

                    <div>
                      <Label htmlFor="discord_link" className="text-white mb-2 block">
                        Ссылка на Discord
                      </Label>
                      <Input
                        id="discord_link"
                        value={settings.discord_link}
                        onChange={(e) => setSettings({ ...settings, discord_link: e.target.value })}
                        className="bg-black/50 border-primary/30 text-white"
                        placeholder="https://discord.gg/..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="vk_link" className="text-white mb-2 block">
                        Ссылка на VK
                      </Label>
                      <Input
                        id="vk_link"
                        value={settings.vk_link}
                        onChange={(e) => setSettings({ ...settings, vk_link: e.target.value })}
                        className="bg-black/50 border-primary/30 text-white"
                        placeholder="https://vk.com/..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="forum_link" className="text-white mb-2 block">
                        Ссылка на форум
                      </Label>
                      <Input
                        id="forum_link"
                        value={settings.forum_link}
                        onChange={(e) => setSettings({ ...settings, forum_link: e.target.value })}
                        className="bg-black/50 border-primary/30 text-white"
                        placeholder="https://forum.example.com"
                      />
                    </div>

                    <Button 
                      onClick={handleSave} 
                      className="w-full neon-glow" 
                      size="lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                          Сохранение...
                        </>
                      ) : (
                        <>
                          <Icon name="Save" size={20} className="mr-2" />
                          Сохранить настройки
                        </>
                      )}
                    </Button>
                  </div>
                </Card>

                <Card className="bg-black/60 backdrop-blur-md border-primary/30 p-6 mt-6">
                  <div className="flex items-center gap-3">
                    <Icon name="Shield" size={24} className="text-primary" />
                    <div>
                      <div className="font-bold">Уровень доступа: Администратор (уровень {user?.admin_level || 0})</div>
                      <div className="text-sm text-gray-400">Вы можете редактировать настройки сервера</div>
                    </div>
                  </div>
                </Card>
              </>
            )}

            {activeTab === 'users' && (
              <Card className="bg-black/60 backdrop-blur-md border-primary/30 p-6">
                <UsersManagement />
              </Card>
            )}

            {activeTab === 'rules' && (
              <RulesManagement userId={user?.u_id || user?.id || 0} />
            )}

            {activeTab === 'cases' && (
              <CasesManagement 
                userId={user?.u_id || user?.id || 0} 
                adminLevel={user?.admin_level || 0}
              />
            )}

            {activeTab === 'logs' && (
              <Card className="bg-black/60 backdrop-blur-md border-primary/30 p-6">
                <LogsViewer />
              </Card>
            )}

            {activeTab === 'blocked' && (
              <BlockedIPsManagement />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;