import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

interface CommunitySectionProps {
  settings: {
    discord_link: string;
    vk_link: string;
    forum_link: string;
  };
}

const CommunitySection = ({ settings }: CommunitySectionProps) => {
  return (
    <section id="community" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl font-bold text-center mb-12 neon-text">Наше сообщество</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-black/60 backdrop-blur-md border-primary/30 p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-[#5865F2] rounded-full flex items-center justify-center">
                <Icon name="MessageCircle" size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Discord</h3>
                <p className="text-gray-400">3 онлайн • 34 участников</p>
              </div>
            </div>
            <Button 
              className="w-full neon-glow" 
              size="lg"
              onClick={() => settings.discord_link && window.open(settings.discord_link, '_blank')}
              disabled={!settings.discord_link}
            >
              Присоединиться к Discord
            </Button>
          </Card>

          <Card className="bg-black/60 backdrop-blur-md border-primary/30 p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-[#0077FF] rounded-full flex items-center justify-center">
                <Icon name="Users" size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-bold">VKontakte</h3>
                <p className="text-gray-400">149 участников</p>
              </div>
            </div>
            <Button 
              className="w-full neon-glow" 
              size="lg"
              onClick={() => settings.vk_link && window.open(settings.vk_link, '_blank')}
              disabled={!settings.vk_link}
            >
              Подписаться ВКонтакте
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
