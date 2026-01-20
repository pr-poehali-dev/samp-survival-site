import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface ProfileHeaderProps {
  serverName: string;
  isAdmin: boolean;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const ProfileHeader = ({ serverName, isAdmin, onNavigate, onLogout }: ProfileHeaderProps) => {
  return (
    <header className="bg-transparent border-b border-white/10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold text-white">{serverName}</div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => onNavigate("/")} className="text-gray-300 hover:text-red-500">
            <Icon name="Home" size={18} className="mr-2" />
            Главная
          </Button>
          {isAdmin && (
            <Button variant="ghost" onClick={() => onNavigate("/admin")} className="text-red-500 hover:text-red-400">
              <Icon name="Settings" size={18} className="mr-2" />
              Админ-панель
            </Button>
          )}
          <Button variant="outline" onClick={onLogout} className="border-gray-600 text-gray-300 hover:text-white hover:border-gray-400">
            <Icon name="LogOut" size={18} className="mr-2" />
            Выйти
          </Button>
        </div>
      </div>
    </header>
  );
};