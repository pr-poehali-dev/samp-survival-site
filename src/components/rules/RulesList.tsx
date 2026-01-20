import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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

interface RulesListProps {
  categories: Category[];
  rulesByCategory: Record<string, Rule[]>;
  username: string;
  onRuleUpdated: () => void;
}

const RulesList = ({ categories, rulesByCategory, username, onRuleUpdated }: RulesListProps) => {
  const [loading, setLoading] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const { toast } = useToast();

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  const handleUpdateRule = async () => {
    if (!editingRule) return;

    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/353a7f9f-c1a8-4395-9120-78c37baa0419', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username,
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
      onRuleUpdated();
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
          username: username,
          rule_id: ruleId
        })
      });

      if (!response.ok) throw new Error('Failed to delete rule');
      
      toast({
        title: "Успешно!",
        description: "Правило удалено",
      });
      
      onRuleUpdated();
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

  return (
    <>
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
    </>
  );
};

export default RulesList;