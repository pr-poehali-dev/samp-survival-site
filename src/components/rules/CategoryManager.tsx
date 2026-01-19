import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Category {
  id: string;
  label: string;
  icon: string;
  order: number;
}

interface CategoryManagerProps {
  categories: Category[];
  rulesByCategory: Record<string, any[]>;
  onCategoriesChange: (categories: Category[]) => void;
}

const CategoryManager = ({ categories, rulesByCategory, onCategoriesChange }: CategoryManagerProps) => {
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState({ id: '', label: '', icon: 'Folder' });
  const { toast } = useToast();

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

    const updated = [...categories, newCat];
    localStorage.setItem('rules_categories', JSON.stringify(updated));
    onCategoriesChange(updated);
    setNewCategory({ id: '', label: '', icon: 'Folder' });
    setShowCategoryDialog(false);
    
    toast({
      title: "Успешно!",
      description: "Категория добавлена",
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    const categoryRules = rulesByCategory[categoryId] || [];
    
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
    localStorage.setItem('rules_categories', JSON.stringify(updated));
    onCategoriesChange(updated);
    
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
    localStorage.setItem('rules_categories', JSON.stringify(updated));
    onCategoriesChange(updated);
  };

  const moveCategoryDown = (index: number) => {
    if (index === categories.length - 1) return;
    const updated = [...categories];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    updated.forEach((cat, idx) => cat.order = idx);
    localStorage.setItem('rules_categories', JSON.stringify(updated));
    onCategoriesChange(updated);
  };

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  return (
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
  );
};

export default CategoryManager;
