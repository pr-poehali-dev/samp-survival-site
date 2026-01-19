import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface HeaderProps {
  serverName: string;
  isLoggedIn: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (value: boolean) => void;
  onNavigate: (path: string) => void;
  onShowHowToPlay: () => void;
}

const Header = ({ 
  serverName, 
  isLoggedIn, 
  mobileMenuOpen, 
  setMobileMenuOpen, 
  onNavigate,
  onShowHowToPlay 
}: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-md border-b border-white/10 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold text-gradient">{serverName}</div>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="#news" className="hover:text-primary transition-colors">Новости</a>
          <button onClick={onShowHowToPlay} className="hover:text-primary transition-colors">Как начать</button>
          <a href="#help" className="hover:text-primary transition-colors">Помощь</a>
          <a href="#forum" className="hover:text-primary transition-colors">Форум</a>
        </nav>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <Button className="hidden md:flex neon-glow" onClick={() => onNavigate('/profile')}>
              <Icon name="User" size={18} className="mr-2" />
              Профиль
            </Button>
          ) : (
            <Button className="hidden md:flex neon-glow" onClick={() => onNavigate('/login')}>
              <Icon name="User" size={18} className="mr-2" />
              Войти
            </Button>
          )}
          
          <button 
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Icon name={mobileMenuOpen ? "X" : "Menu"} size={24} />
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-black/95 border-t border-white/10">
          <nav className="flex flex-col p-4 gap-4">
            <a href="#news" className="hover:text-primary transition-colors">Новости</a>
            <button onClick={onShowHowToPlay} className="hover:text-primary transition-colors text-left">Как начать</button>
            <a href="#help" className="hover:text-primary transition-colors">Помощь</a>
            <a href="#forum" className="hover:text-primary transition-colors">Форум</a>
            {isLoggedIn ? (
              <Button className="w-full neon-glow" onClick={() => onNavigate('/profile')}>
                <Icon name="User" size={18} className="mr-2" />
                Профиль
              </Button>
            ) : (
              <Button className="w-full neon-glow" onClick={() => onNavigate('/login')}>
                <Icon name="User" size={18} className="mr-2" />
                Войти
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;