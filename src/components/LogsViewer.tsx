import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";

interface Log {
  id: number;
  category: string;
  user_id: number | null;
  user_name: string | null;
  action: string;
  details: string | null;
  ip_address: string | null;
  created_at: string;
}

const CATEGORIES = [
  { value: 'all', label: 'Все логи', icon: 'List' },
  { value: 'login', label: 'Входы', icon: 'LogIn' },
  { value: 'logout', label: 'Выходы', icon: 'LogOut' },
  { value: 'kill', label: 'Убийства', icon: 'Skull' },
  { value: 'death', label: 'Смерти', icon: 'HeartCrack' },
  { value: 'admin', label: 'Админ', icon: 'Shield' },
  { value: 'chat', label: 'Чат', icon: 'MessageSquare' },
  { value: 'trade', label: 'Торговля', icon: 'ArrowLeftRight' },
  { value: 'spawn', label: 'Спавн', icon: 'MapPin' },
];

const LogsViewer = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchUser, setSearchUser] = useState('');
  const [total, setTotal] = useState(0);
  const { toast } = useToast();

  const fetchLogs = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (searchUser.trim()) {
        params.append('user_name', searchUser.trim());
      }
      params.append('limit', '50');
      
      const url = `https://functions.poehali.dev/87a1d7ee-a438-4ee1-bb8b-40f381ca8de7?${params.toString()}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.logs) {
        setLogs(data.logs);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить логи",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedCategory, searchUser]);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      login: 'text-green-500',
      logout: 'text-gray-500',
      kill: 'text-red-500',
      death: 'text-orange-500',
      admin: 'text-purple-500',
      chat: 'text-blue-500',
      trade: 'text-yellow-500',
      spawn: 'text-cyan-500',
    };
    return colors[category] || 'text-gray-400';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-2xl font-bold flex items-center gap-2">
          <Icon name="FileText" size={28} className="text-primary" />
          Логи сервера ({total})
        </h3>
        <div className="flex gap-2">
          <Input
            placeholder="Поиск по имени..."
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            className="w-64"
          />
          <Button onClick={fetchLogs} variant="outline" size="sm">
            <Icon name="RefreshCw" size={16} className="mr-2" />
            Обновить
          </Button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            variant={selectedCategory === cat.value ? "default" : "outline"}
            size="sm"
            className={selectedCategory === cat.value ? 'neon-glow' : ''}
          >
            <Icon name={cat.icon as any} size={16} className="mr-2" />
            {cat.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.length === 0 ? (
            <Card className="bg-black/60 backdrop-blur-md border-primary/30 p-8 text-center">
              <Icon name="FileX" size={48} className="mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">Логи не найдены</p>
            </Card>
          ) : (
            logs.map((log) => (
              <Card key={log.id} className="bg-black/60 backdrop-blur-md border-primary/30 p-4 hover:border-primary/50 transition-all">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center text-sm">
                  <div className="md:col-span-2 text-gray-500 font-mono text-xs">
                    {formatDate(log.created_at)}
                  </div>
                  
                  <div className={`md:col-span-1 font-bold uppercase ${getCategoryColor(log.category)}`}>
                    {log.category}
                  </div>
                  
                  <div className="md:col-span-2">
                    {log.user_name ? (
                      <span className="text-blue-400">{log.user_name}</span>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                    {log.user_id && (
                      <span className="text-gray-600 ml-1 text-xs">(ID: {log.user_id})</span>
                    )}
                  </div>
                  
                  <div className="md:col-span-5 text-gray-300">
                    {log.action}
                    {log.details && (
                      <span className="text-gray-500 ml-2 text-xs">• {log.details}</span>
                    )}
                  </div>
                  
                  <div className="md:col-span-2 text-right">
                    {log.ip_address ? (
                      <span className="text-gray-600 font-mono text-xs">{log.ip_address}</span>
                    ) : (
                      <span className="text-gray-700">—</span>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default LogsViewer;
