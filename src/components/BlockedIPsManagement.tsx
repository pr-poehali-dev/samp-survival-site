import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Icon from "@/components/ui/icon";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface BlockedIP {
  id: number;
  ip_address: string;
  failed_attempts: number;
  temp_blocked_until: string | null;
  permanently_blocked: boolean;
  attempted_login: string | null;
  created_at: string;
  updated_at: string;
}

const BlockedIPsManagement = () => {
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchBlockedIPs = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/56f6b297-dc8f-4b8c-915b-e0291dc4267a', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list_blocks' })
      });

      if (response.ok) {
        const data = await response.json();
        setBlockedIPs(data.blocks || []);
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить список блокировок",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to fetch blocked IPs:', error);
      toast({
        title: "Ошибка сети",
        description: "Не удалось подключиться к серверу",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (ipAddress: string) => {
    try {
      const response = await fetch('https://functions.poehali.dev/56f6b297-dc8f-4b8c-915b-e0291dc4267a', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'unblock',
          ip: ipAddress
        })
      });

      if (response.ok) {
        toast({
          title: "Успешно",
          description: `IP ${ipAddress} разблокирован`,
        });
        fetchBlockedIPs();
      } else {
        const data = await response.json();
        toast({
          title: "Ошибка",
          description: data.error || "Не удалось разблокировать IP",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to unblock IP:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось подключиться к серверу",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchBlockedIPs();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const isBlocked = (ip: BlockedIP) => {
    if (ip.permanently_blocked) return true;
    if (ip.temp_blocked_until) {
      return new Date(ip.temp_blocked_until) > new Date();
    }
    return false;
  };

  const getBlockStatus = (ip: BlockedIP) => {
    if (ip.permanently_blocked) {
      return <Badge variant="destructive">Постоянная блокировка</Badge>;
    }
    if (ip.temp_blocked_until && new Date(ip.temp_blocked_until) > new Date()) {
      return <Badge variant="secondary">Временная блокировка до {formatDate(ip.temp_blocked_until)}</Badge>;
    }
    return <Badge variant="outline">Не заблокирован</Badge>;
  };

  return (
    <Card className="p-6 bg-black/40 backdrop-blur-sm border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gradient mb-2">Заблокированные IP</h2>
          <p className="text-gray-400">Управление блокировками пользователей</p>
        </div>
        <Button onClick={fetchBlockedIPs} disabled={loading} variant="outline">
          <Icon name="RefreshCw" size={18} className="mr-2" />
          Обновить
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Icon name="Loader2" size={32} className="animate-spin text-primary" />
        </div>
      ) : blockedIPs.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Icon name="ShieldCheck" size={48} className="mx-auto mb-4 text-green-500" />
          <p>Нет заблокированных IP-адресов</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="text-gray-400">IP-адрес</TableHead>
                <TableHead className="text-gray-400">Попытка входа под</TableHead>
                <TableHead className="text-gray-400">Неудачные попытки</TableHead>
                <TableHead className="text-gray-400">Статус</TableHead>
                <TableHead className="text-gray-400">Последнее обновление</TableHead>
                <TableHead className="text-gray-400 text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blockedIPs.map((ip) => (
                <TableRow key={ip.id} className="border-white/10">
                  <TableCell className="font-mono text-white">{ip.ip_address}</TableCell>
                  <TableCell className="text-gray-300">
                    {ip.attempted_login ? (
                      <span className="font-semibold">{ip.attempted_login}</span>
                    ) : (
                      <span className="text-gray-500 italic">не указано</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={ip.failed_attempts >= 5 ? "destructive" : "secondary"}>
                      {ip.failed_attempts} / 5
                    </Badge>
                  </TableCell>
                  <TableCell>{getBlockStatus(ip)}</TableCell>
                  <TableCell className="text-gray-400">{formatDate(ip.updated_at)}</TableCell>
                  <TableCell className="text-right">
                    {isBlocked(ip) && (
                      <Button
                        onClick={() => handleUnblock(ip.ip_address)}
                        variant="outline"
                        size="sm"
                        className="border-green-500/30 text-green-500 hover:bg-green-500/10"
                      >
                        <Icon name="ShieldOff" size={16} className="mr-2" />
                        Разблокировать
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
};

export default BlockedIPsManagement;