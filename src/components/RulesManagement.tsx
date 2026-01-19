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

interface Rule {
  id: number;
  category: string;
  title: string;
  description: string;
  rule_order: number;
}

interface RulesManagementProps {
  userId: number;
}

const RulesManagement = ({ userId }: RulesManagementProps) => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [newRule, setNewRule] = useState({
    category: 'players',
    title: '',
    description: '',
    rule_order: 0
  });
  const { toast } = useToast();

  const CATEGORIES = {
    players: 'Правила для игроков',
    factions: 'Правила для фракций',
    general: 'Общие правила'
  };

  const ICONS = {
    players: 'UserCheck',
    factions: 'Shield',
    general: 'AlertTriangle'
  };

  useEffect(() => {
    fetchRules();
  }, []);

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
      
      setNewRule({ category: 'players', title: '', description: '', rule_order: 0 });
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

  return (
    <div className="space-y-6">
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
                {Object.entries(CATEGORIES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
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

      {Object.entries(CATEGORIES).map(([category, label]) => (
        <Card key={category} className="bg-black/60 backdrop-blur-md border-primary/30 p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Icon name={ICONS[category as keyof typeof ICONS]} size={24} className="text-primary" />
            {label}
          </h3>
          
          <div className="space-y-3">
            {(rulesByCategory[category] || []).map((rule) => (
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
                      <Button size="sm" onClick={handleUpdateRule} disabled={loading}>
                        <Icon name="Check" size={16} className="mr-1" />
                        Сохранить
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingRule(null)}>
                        <Icon name="X" size={16} className="mr-1" />
                        Отмена
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card key={rule.id} className="bg-black/40 p-4 border-white/10 hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-semibold text-white mb-1">{rule.title}</div>
                      <div className="text-sm text-gray-400">{rule.description}</div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => setEditingRule(rule)}>
                        <Icon name="Edit" size={16} />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteRule(rule.id)} disabled={loading}>
                        <Icon name="Trash2" size={16} className="text-red-400" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            ))}
            
            {(!rulesByCategory[category] || rulesByCategory[category].length === 0) && (
              <p className="text-gray-500 text-center py-4">Правил нет</p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default RulesManagement;
