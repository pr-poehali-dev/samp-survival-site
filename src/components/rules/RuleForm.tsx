import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Category {
  id: string;
  label: string;
  icon: string;
  order: number;
}

interface RuleFormProps {
  categories: Category[];
  username: string;
  onRuleSaved: () => void;
}

const RuleForm = ({ categories, username, onRuleSaved }: RuleFormProps) => {
  const [loading, setLoading] = useState(false);
  const [newRule, setNewRule] = useState({
    category: categories[0]?.id || 'players',
    title: '',
    description: '',
    rule_order: 0
  });
  const { toast } = useToast();

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

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
          username: username,
          ...newRule
        })
      });

      if (!response.ok) throw new Error('Failed to save rule');
      
      toast({
        title: "Успешно!",
        description: "Правило добавлено",
      });
      
      setNewRule({ category: categories[0]?.id || 'players', title: '', description: '', rule_order: 0 });
      onRuleSaved();
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

  return (
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
  );
};

export default RuleForm;