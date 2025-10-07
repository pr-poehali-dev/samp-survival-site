import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface AdminPanelProps {
  serverName: string;
  onServerNameChange: (newName: string) => void;
}

const AdminPanel = ({ serverName, onServerNameChange }: AdminPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [newServerName, setNewServerName] = useState(serverName);
  const [error, setError] = useState('');

  const ADMIN_PASSWORD = 'admin123';

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Неверный пароль');
    }
  };

  const handleSave = () => {
    if (newServerName.trim()) {
      onServerNameChange(newServerName);
      setIsOpen(false);
      setIsAuthenticated(false);
      setPassword('');
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsAuthenticated(false);
    setPassword('');
    setError('');
    setNewServerName(serverName);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full gta-gradient text-white shadow-lg hover:opacity-90 z-50"
      >
        <Icon name="Settings" size={24} />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-[#202020] border-[#FF6B00]/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gradient">Админ-панель</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
            >
              <Icon name="X" size={20} />
            </Button>
          </div>
          <CardDescription>
            {isAuthenticated ? 'Настройки сервера' : 'Введите пароль для доступа'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isAuthenticated ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Введите пароль"
                  className="bg-[#1A1A1A] border-[#FF6B00]/30"
                />
              </div>
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
              <Button
                onClick={handleLogin}
                className="w-full gta-gradient text-white"
              >
                Войти
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="serverName">Название сервера</Label>
                <Input
                  id="serverName"
                  value={newServerName}
                  onChange={(e) => setNewServerName(e.target.value)}
                  placeholder="SAMP SURVIVAL"
                  className="bg-[#1A1A1A] border-[#FF6B00]/30"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  className="flex-1 gta-gradient text-white"
                >
                  Сохранить
                </Button>
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="flex-1 border-[#FF6B00]/30"
                >
                  Отмена
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
