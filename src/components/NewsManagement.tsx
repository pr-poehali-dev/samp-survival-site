import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";

interface News {
  id: number;
  title: string;
  description: string;
  image_url: string;
  created_at: string;
}

interface NewsManagementProps {
  username: string;
}

const NewsManagement = ({ username }: NewsManagementProps) => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [newNews, setNewNews] = useState({
    title: '',
    description: '',
    image_url: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/f3335412-664a-4023-91a6-5cec4935678b');
      if (!response.ok) throw new Error('Failed to fetch news');
      const data = await response.json();
      setNews(data.news || []);
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить новости",
        variant: "destructive",
      });
    }
  };

  const handleSaveNews = async () => {
    if (!newNews.title || !newNews.description) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/f3335412-664a-4023-91a6-5cec4935678b', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          ...newNews
        })
      });

      if (!response.ok) throw new Error('Failed to save news');
      
      toast({
        title: "Успешно!",
        description: "Новость добавлена",
      });
      
      setNewNews({ title: '', description: '', image_url: '' });
      fetchNews();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить новость",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNews = async () => {
    if (!editingNews) return;

    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/f3335412-664a-4023-91a6-5cec4935678b', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          news_id: editingNews.id,
          title: editingNews.title,
          description: editingNews.description,
          image_url: editingNews.image_url
        })
      });

      if (!response.ok) throw new Error('Failed to update news');
      
      toast({
        title: "Успешно!",
        description: "Новость обновлена",
      });
      
      setEditingNews(null);
      fetchNews();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить новость",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNews = async (newsId: number) => {
    if (!confirm('Удалить эту новость?')) return;

    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/f3335412-664a-4023-91a6-5cec4935678b', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          news_id: newsId
        })
      });

      if (!response.ok) throw new Error('Failed to delete news');
      
      toast({
        title: "Успешно!",
        description: "Новость удалена",
      });
      
      fetchNews();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить новость",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-black/60 backdrop-blur-md border-primary/30 p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Icon name="Plus" size={24} className="text-primary" />
          Добавить новость
        </h3>
        
        <div className="space-y-4">
          <div>
            <Label>Заголовок</Label>
            <Input
              value={newNews.title}
              onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
              className="bg-black/40 border-white/10"
              placeholder="Название новости"
            />
          </div>
          
          <div>
            <Label>Описание</Label>
            <Textarea
              value={newNews.description}
              onChange={(e) => setNewNews({ ...newNews, description: e.target.value })}
              className="bg-black/40 border-white/10 min-h-[100px]"
              placeholder="Подробное описание новости"
            />
          </div>
          
          <div>
            <Label>URL картинки (необязательно)</Label>
            <Input
              value={newNews.image_url}
              onChange={(e) => setNewNews({ ...newNews, image_url: e.target.value })}
              className="bg-black/40 border-white/10"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          
          <Button onClick={handleSaveNews} disabled={loading} className="neon-glow">
            <Icon name="Save" size={18} className="mr-2" />
            Добавить новость
          </Button>
        </div>
      </Card>

      <Card className="bg-black/60 backdrop-blur-md border-primary/30 p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Icon name="Newspaper" size={24} className="text-primary" />
          Все новости ({news.length})
        </h3>
        
        <div className="space-y-3">
          {news.map((item) => (
            editingNews?.id === item.id ? (
              <Card key={item.id} className="bg-black/40 p-4 border-primary/20">
                <div className="space-y-3">
                  <Input
                    value={editingNews.title}
                    onChange={(e) => setEditingNews({ ...editingNews, title: e.target.value })}
                    className="bg-black/60 border-white/10"
                  />
                  <Textarea
                    value={editingNews.description}
                    onChange={(e) => setEditingNews({ ...editingNews, description: e.target.value })}
                    className="bg-black/60 border-white/10"
                  />
                  <Input
                    value={editingNews.image_url}
                    onChange={(e) => setEditingNews({ ...editingNews, image_url: e.target.value })}
                    className="bg-black/60 border-white/10"
                    placeholder="URL картинки"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleUpdateNews} size="sm" disabled={loading}>
                      <Icon name="Check" size={16} className="mr-2" />
                      Сохранить
                    </Button>
                    <Button onClick={() => setEditingNews(null)} variant="outline" size="sm">
                      <Icon name="X" size={16} className="mr-2" />
                      Отмена
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card key={item.id} className="bg-black/40 p-4 border-white/10 hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {item.image_url && (
                      <img src={item.image_url} alt={item.title} className="w-20 h-20 object-cover rounded mb-2" />
                    )}
                    <h4 className="font-bold text-white mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-400 mb-2">{item.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.created_at).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingNews(item)}
                    >
                      <Icon name="Edit" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNews(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          ))}
          
          {news.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Icon name="FileX" size={48} className="mx-auto mb-2 text-gray-700" />
              <p>Новостей пока нет</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default NewsManagement;
