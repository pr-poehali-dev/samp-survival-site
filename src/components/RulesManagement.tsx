import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import CategoryManager from "./rules/CategoryManager";
import RuleForm from "./rules/RuleForm";
import RulesList from "./rules/RulesList";

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

  const rulesByCategory = rules.reduce((acc, rule) => {
    if (!acc[rule.category]) acc[rule.category] = [];
    acc[rule.category].push(rule);
    return acc;
  }, {} as Record<string, Rule[]>);

  return (
    <div className="space-y-6">
      <CategoryManager 
        categories={categories} 
        rulesByCategory={rulesByCategory}
        onCategoriesChange={setCategories}
      />

      <RuleForm 
        categories={categories}
        userId={userId}
        onRuleSaved={fetchRules}
      />

      <RulesList 
        categories={categories}
        rulesByCategory={rulesByCategory}
        userId={userId}
        onRuleUpdated={fetchRules}
      />
    </div>
  );
};

export default RulesManagement;
