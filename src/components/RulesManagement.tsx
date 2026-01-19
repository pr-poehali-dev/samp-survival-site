import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Rule {
  id: number;
  category: string;
  title: string;
  description: string;
  rule_order: number;
}

interface Category {
  id: string;
  label: string;
  icon: string;
  order: number;
}

interface RulesManagementProps {
  userId: number;
}

const RulesManagement = ({ userId }: RulesManagementProps) => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [categories, setCategories] = useState<Category[]>([
    { id: 'players', label: 'Правила для игроков', icon: 'UserCheck', order: 0 },
    { id: 'factions', label: 'Правила для фракций', icon: 'Shield', order: 1 },
    { id: 'general', label: 'Общие правила', icon: 'AlertTriangle', order: 2 }
  ]);
  const [loading, setLoading] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [newRule, setNewRule] = useState({
    category: 'players',
    title: '',
    description: '',
    rule_order: 0
  });
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState({ id: '', label: '', icon: 'Folder' });
  const { toast } = useToast();

  useEffect(() => {
    fetchRules();
    loadCategories();
  }, []);

  const loadCategories = () => {
    const saved = localStorage.getItem('rules_categories');
    if (saved) {
      setCategories(JSON.parse(saved));
    }
  };

  const saveCategories = (cats: Category[]) => {
    localStorage.setItem('rules_categories', JSON.stringify(cats));
    setCategories(cats);
  };

  const fetchRules = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/353a7f9f-c1a8-4395-9120-78c37baa0419');
      if (!response.ok) throw new Error('Failed to fetch rules');
      const data = await response.json();
      setRules(data.rules || []);
    } catch (error) {
      console.error('Error fetching rules:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить правила",
        variant: "destructive",
      });
    }
  };

  const handleAddCategory = () => {
    if (!newCategory.id || !newCategory.label) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля категории",
        variant: "destructive",
      });
      return;
    }

    if (categories.find(c => c.id === newCategory.id)) {
      toast({
        title: "Ошибка",
        description: "Категория с таким ID уже существует",
        variant: "destructive",
      });
      return;
    }

    const newCat: Category = {
      ...newCategory,
      order: categories.length
    };

    saveCategories([...categories, newCat]);
    setNewCategory({ id: '', label: '', icon: 'Folder' });
    setShowCategoryDialog(false);
    
    toast({
      title: "Успешно!",
      description: "Категория добавлена",
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    const categoryRules = rules.filter(r => r.category === categoryId);
    
    if (categoryRules.length > 0) {
      toast({
        title: "Ошибка",
        description: `Нельзя удалить категорию с правилами (${categoryRules.length} шт.)`,
        variant: "destructive",
      });
      return;
    }

    if (!confirm('Удалить эту категорию?')) return;

    const updated = categories.filter(c => c.id !== categoryId);
    saveCategories(updated);
    
    toast({
      title: "Успешно!",
      description: "Категория удалена",
    });
  };

  const moveCategoryUp = (index: number) => {
    if (index === 0) return;
    const updated = [...categories];
    [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
    updated.forEach((cat, idx) => cat.order = idx);
    saveCategories(updated);
  };

  const moveCategoryDown = (index: number) => {
    if (index === categories.length - 1) return;
    const updated = [...categories];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    updated.forEach((cat, idx) => cat.order = idx);
    saveCategories(updated);
  };

  const handleSaveRule = async () => {
    if (!newRule.title || !newRule.description) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/353a7f9f-c1a8-4395-9120-78c37baa0419', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          ...newRule
        })
      });

      if (!response.ok) throw new Error('Failed to save rule');
      
      toast({
        title: "Успешно!",
        description: "Правило добавлено",
      });
      
      setNewRule({ category: categories[0]?.id || 'players', title: '', description: '', rule_order: 0 });
      await fetchRules();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить правило",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRule = async () => {
    if (!editingRule) return;

    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/353a7f9f-c1a8-4395-9120-78c37baa0419', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          rule_id: editingRule.id,
          category: editingRule.category,
          title: editingRule.title,
          description: editingRule.description,
          rule_order: editingRule.rule_order
        })
      });

      if (!response.ok) throw new Error('Failed to update rule');
      
      toast({
        title: "Успешно!",
        description: "Правило обновлено",
      });
      
      setEditingRule(null);
      await fetchRules();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить правило",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRule = async (ruleId: number) => {
    if (!confirm('Удалить это правило?')) return;

    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/353a7f9f-c1a8-4395-9120-78c37baa0419', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          rule_id: ruleId
        })
      });

      if (!response.ok) throw new Error('Failed to delete rule');
      
      toast({
        title: "Успешно!",
        description: "Правило удалено",
      });
      
      await fetchRules();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить правило",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const rulesByCategory = rules.reduce((acc, rule) => {
    if (!acc[rule.category]) acc[rule.category] = [];
    acc[rule.category].push(rule);
    return acc;
  }, {} as Record<string, Rule[]>);

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <Card className="bg-black/60 backdrop-blur-md border-primary/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Icon name="FolderTree" size={24} className="text-primary" />
            Управление категориями
          </h3>
          <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить категорию
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black/95 border-primary/30">
              <DialogHeader>
                <DialogTitle>Новая категория</DialogTitle>
                <DialogDescription>Добавьте новую категорию правил</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>ID категории (латиницей)</Label>
                  <Input
                    value={newCategory.id}
                    onChange={(e) => setNewCategory({ ...newCategory, id: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                    className="bg-black/40 border-white/10"
                    placeholder="admin_rules"
                  />
                </div>
                <div>
                  <Label>Название</Label>
                  <Input
                    value={newCategory.label}
                    onChange={(e) => setNewCategory({ ...newCategory, label: e.target.value })}
                    className="bg-black/40 border-white/10"
                    placeholder="Правила для администрации"
                  />
                </div>
                <div>
                  <Label>Иконка (название из lucide-react)</Label>
                  <Input
                    value={newCategory.icon}
                    onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                    className="bg-black/40 border-white/10"
                    placeholder="Shield"
                  />
                </div>
                <Button onClick={handleAddCategory} className="w-full">
                  <Icon name="Check" size={16} className="mr-2" />
                  Создать категорию
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-2">
          {sortedCategories.map((cat, index) => (
            <div key={cat.id} className="flex items-center gap-2 p-3 bg-black/40 rounded-lg border border-white/10">
              <Icon name={cat.icon as any} size={20} className="text-primary" />
              <span className="flex-1 font-medium">{cat.label}</span>
              <span className="text-sm text-gray-400">({rulesByCategory[cat.id]?.length || 0} правил)</span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveCategoryUp(index)}
                  disabled={index === 0}
                >
                  <Icon name="ChevronUp" size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveCategoryDown(index)}
                  disabled={index === sortedCategories.length - 1}
                >
                  <Icon name="ChevronDown" size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Icon name="Trash2" size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="bg-black/60 backdrop-blur-md border-primary/30 p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Icon name="Plus" size={24} className="text-primary" />
          Добавить новое правило
        </h3>
        
        <div className="space-y-4">
          <div>
            <Label>Категория</Label>
            <Select value={newRule.category} onValueChange={(value) => setNewRule({ ...newRule, category: value })}>
              <SelectTrigger className="bg-black/40 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortedCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Заголовок</Label>
            <Input
              value={newRule.title}
              onChange={(e) => setNewRule({ ...newRule, title: e.target.value })}
              className="bg-black/40 border-white/10"
              placeholder="Например: Запрещено использование читов"
            />
          </div>
          
          <div>
            <Label>Описание</Label>
            <Textarea
              value={newRule.description}
              onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
              className="bg-black/40 border-white/10 min-h-[80px]"
              placeholder="Подробное описание правила"
            />
          </div>
          
          <div>
            <Label>Порядок</Label>
            <Input
              type="number"
              value={newRule.rule_order}
              onChange={(e) => setNewRule({ ...newRule, rule_order: parseInt(e.target.value) || 0 })}
              className="bg-black/40 border-white/10"
            />
          </div>
          
          <Button onClick={handleSaveRule} disabled={loading} className="neon-glow">
            <Icon name="Save" size={18} className="mr-2" />
            Добавить правило
          </Button>
        </div>
      </Card>

      {sortedCategories.map((cat) => (
        <Card key={cat.id} className="bg-black/60 backdrop-blur-md border-primary/30 p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Icon name={cat.icon as any} size={24} className="text-primary" />
            {cat.label}
          </h3>
          
          <div className="space-y-3">
            {(rulesByCategory[cat.id] || []).map((rule) => (
              editingRule?.id === rule.id ? (
                <Card key={rule.id} className="bg-black/40 p-4 border-primary/20">
                  <div className="space-y-3">
                    <Input
                      value={editingRule.title}
                      onChange={(e) => setEditingRule({ ...editingRule, title: e.target.value })}
                      className="bg-black/60 border-white/10"
                    />
                    <Textarea
                      value={editingRule.description}
                      onChange={(e) => setEditingRule({ ...editingRule, description: e.target.value })}
                      className="bg-black/60 border-white/10"
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleUpdateRule} size="sm" disabled={loading}>
                        <Icon name="Check" size={16} className="mr-2" />
                        Сохранить
                      </Button>
                      <Button onClick={() => setEditingRule(null)} variant="outline" size="sm">
                        <Icon name="X" size={16} className="mr-2" />
                        Отмена
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card key={rule.id} className="bg-black/40 p-4 border-white/10 hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-bold text-white mb-1">{rule.title}</h4>
                      <p className="text-sm text-gray-400">{rule.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingRule(rule)}
                      >
                        <Icon name="Edit" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRule(rule.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            ))}
            
            {(!rulesByCategory[cat.id] || rulesByCategory[cat.id].length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <Icon name="FileX" size={48} className="mx-auto mb-2 text-gray-700" />
                <p>Нет правил в этой категории</p>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default RulesManagement;
