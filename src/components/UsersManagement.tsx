import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";

interface User {
  u_id: number;
  u_name: string;
  u_email: string;
  u_date_registration: string;
  u_lifetime: number;
  u_money: number;
  u_donate: number;
  u_score: number;
  u_mute: number;
  u_ip: string;
}

const UsersManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUsers, setShowUsers] = useState(false);
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{ u_money: number; u_donate: number; u_mute: number }>({
    u_money: 0,
    u_donate: 0,
    u_mute: 0
  });
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://functions.poehali.dev/a41a848a-3f67-4204-b161-8f5de2014207');
      const data = await response.json();
      
      if (data.users) {
        setUsers(data.users);
        if (searchQuery.trim()) {
          filterUsers(data.users, searchQuery);
        } else {
          setFilteredUsers(data.users);
        }
        setShowUsers(true);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить пользователей",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = (userList: User[], query: string) => {
    const lowerQuery = query.toLowerCase().trim();
    
    const filtered = userList.filter(user => {
      const matchName = user.u_name.toLowerCase().includes(lowerQuery);
      const matchId = user.u_id.toString().includes(lowerQuery);
      const matchEmail = user.u_email.toLowerCase().includes(lowerQuery);
      return matchName || matchId || matchEmail;
    });
    
    setFilteredUsers(filtered);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && users.length > 0) {
      filterUsers(users, searchQuery);
    } else if (!searchQuery.trim() && users.length > 0) {
      setFilteredUsers(users);
    }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      if (searchQuery.trim()) {
        filterUsers(users, searchQuery);
      } else {
        setFilteredUsers(users);
      }
    }
  }, [searchQuery, users]);

  const startEditing = (user: User) => {
    setEditingUser(user.u_id);
    setEditValues({
      u_money: user.u_money,
      u_donate: user.u_donate,
      u_mute: user.u_mute
    });
  };

  const cancelEditing = () => {
    setEditingUser(null);
  };

  const saveUser = async (userId: number) => {
    try {
      const response = await fetch('https://functions.poehali.dev/a41a848a-3f67-4204-b161-8f5de2014207', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          action: 'update',
          ...editValues
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Успешно!",
          description: "Данные пользователя обновлены"
        });
        setEditingUser(null);
        await fetchUsers();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить пользователя",
        variant: "destructive"
      });
    }
  };

  const deleteUser = async (userId: number, userName: string) => {
    if (!confirm(`Вы уверены, что хотите удалить пользователя ${userName}?`)) {
      return;
    }

    try {
      const response = await fetch(`https://functions.poehali.dev/a41a848a-3f67-4204-b161-8f5de2014207?user_id=${userId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Успешно!",
          description: "Пользователь удалён"
        });
        await fetchUsers();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить пользователя",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-2xl font-bold flex items-center gap-2">
          <Icon name="Users" size={28} className="text-primary" />
          Управление пользователями
        </h3>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Поиск по имени, ID или email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button onClick={fetchUsers} disabled={loading} variant="outline">
          {loading ? (
            <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
          ) : (
            <Icon name="RefreshCw" size={16} className="mr-2" />
          )}
          Обновить
        </Button>
      </div>

      {loading && users.length === 0 ? (
        <Card className="bg-black/60 backdrop-blur-md border-primary/30 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-400 mt-4">Загрузка пользователей...</p>
        </Card>
      ) : filteredUsers.length === 0 ? (
        <Card className="bg-black/60 backdrop-blur-md border-primary/30 p-8 text-center">
          <Icon name="UserX" size={48} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400">Пользователи не найдены</p>
          <p className="text-gray-600 text-sm mt-2">Попробуйте изменить поисковый запрос</p>
        </Card>
      ) : (
        <>
          <div className="text-sm text-gray-400">
            Найдено пользователей: {filteredUsers.length} из {users.length}
          </div>
          <div className="grid gap-4">
            {filteredUsers.map((user) => (
          <Card key={user.u_id} className="bg-black/60 backdrop-blur-md border-primary/30 p-4 horror-glow">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
              <div>
                <div className="text-sm text-gray-400">ID: {user.u_id}</div>
                <div className="font-bold text-lg">{user.u_name}</div>
                <div className="text-xs text-gray-500">{user.u_email}</div>
                <div className="text-xs text-gray-600 mt-1">
                  Регистрация: {new Date(user.u_date_registration).toLocaleDateString()}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm">
                  <Icon name="Clock" size={14} className="inline mr-1 text-primary" />
                  Игровое время: {Math.floor(user.u_lifetime / 60)}ч
                </div>
                <div className="text-sm">
                  <Icon name="MapPin" size={14} className="inline mr-1 text-primary" />
                  IP: {user.u_ip}
                </div>
                <div className="text-sm">
                  <Icon name="Trophy" size={14} className="inline mr-1 text-primary" />
                  Очки: {user.u_score}
                </div>
              </div>

              <div className="space-y-2">
                {editingUser === user.u_id ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Icon name="Wallet" size={14} className="text-primary" />
                      <Input
                        type="number"
                        value={editValues.u_money}
                        onChange={(e) => setEditValues({ ...editValues, u_money: parseInt(e.target.value) || 0 })}
                        className="h-8 text-sm"
                        placeholder="Деньги"
                      />
                      <span className="text-sm">₽</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Gem" size={14} className="text-primary" />
                      <Input
                        type="number"
                        value={editValues.u_donate}
                        onChange={(e) => setEditValues({ ...editValues, u_donate: parseInt(e.target.value) || 0 })}
                        className="h-8 text-sm"
                        placeholder="Донат"
                      />
                      <span className="text-sm">₽</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Ban" size={14} className="text-primary" />
                      <Input
                        type="number"
                        value={editValues.u_mute}
                        onChange={(e) => setEditValues({ ...editValues, u_mute: parseInt(e.target.value) || 0 })}
                        className="h-8 text-sm"
                        placeholder="Мут (0/1)"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-sm">
                      <Icon name="Wallet" size={14} className="inline mr-1 text-green-500" />
                      Деньги: {user.u_money}₽
                    </div>
                    <div className="text-sm">
                      <Icon name="Gem" size={14} className="inline mr-1 text-yellow-500" />
                      Донат: {user.u_donate}₽
                    </div>
                    <div className="text-sm">
                      <Icon name="Ban" size={14} className="inline mr-1 text-red-500" />
                      Мут: {user.u_mute ? 'Да' : 'Нет'}
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-2">
                {editingUser === user.u_id ? (
                  <>
                    <Button onClick={() => saveUser(user.u_id)} size="sm" className="neon-glow flex-1">
                      <Icon name="Check" size={16} className="mr-1" />
                      Сохранить
                    </Button>
                    <Button onClick={cancelEditing} size="sm" variant="outline" className="flex-1">
                      <Icon name="X" size={16} className="mr-1" />
                      Отмена
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={() => startEditing(user)} size="sm" variant="outline" className="flex-1">
                      <Icon name="Edit" size={16} className="mr-1" />
                      Изменить
                    </Button>
                    <Button 
                      onClick={() => deleteUser(user.u_id, user.u_name)} 
                      size="sm" 
                      variant="destructive"
                      className="flex-1"
                    >
                      <Icon name="Trash2" size={16} className="mr-1" />
                      Удалить
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
          </div>
        </>
      )}
    </div>
  );
};

export default UsersManagement;