import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CaseConfig {
  case_id: number;
  case_name: string;
  price_money: number;
  price_donate: number;
  description: string;
  rarity: string;
}

interface Item {
  loot_id: number;
  loot_name: string;
  loot_price: number;
  drop_chance: number;
  loot_type: string;
}

interface CasesManagementProps {
  userId: number;
}

const CasesManagement = ({ userId }: CasesManagementProps) => {
  const [cases, setCases] = useState<CaseConfig[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingCase, setEditingCase] = useState<CaseConfig | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [filter, setFilter] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/09aee658-398c-499d-9dc2-2b3c508b0f13');
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setCases(data.cases || []);
      setItems(data.items || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCase = async () => {
    if (!editingCase) return;

    if (!userId || userId === 0) {
      toast({
        title: "Ошибка",
        description: "Не удалось определить ID пользователя. Попробуйте перезайти.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Updating case with userId:', userId);
      const response = await fetch('https://functions.poehali.dev/09aee658-398c-499d-9dc2-2b3c508b0f13', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          case_id: editingCase.case_id,
          price_money: editingCase.price_money,
          price_donate: editingCase.price_donate
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Update failed:', errorData);
        throw new Error(errorData.error || 'Failed to update case');
      }
      
      toast({
        title: "Успешно!",
        description: "Цены кейса обновлены",
      });
      
      setEditingCase(null);
      await fetchData();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить кейс",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;

    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/09aee658-398c-499d-9dc2-2b3c508b0f13', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          loot_id: editingItem.loot_id,
          loot_price: editingItem.loot_price,
          drop_chance: editingItem.drop_chance
        })
      });

      if (!response.ok) throw new Error('Failed to update item');
      
      toast({
        title: "Успешно!",
        description: "Предмет обновлён",
      });
      
      setEditingItem(null);
      await fetchData();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить предмет",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => 
    item.loot_name?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="bg-black/60 backdrop-blur-md border-primary/30 p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Icon name="Gift" size={24} className="text-primary" />
          Настройки кейсов
        </h3>
        
        <div className="space-y-4">
          {cases.map((caseItem) => (
            editingCase?.case_id === caseItem.case_id ? (
              <Card key={caseItem.case_id} className="bg-black/40 p-4 border-primary/20">
                <div className="space-y-3">
                  <div className="font-bold text-lg">{caseItem.case_name}</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Цена (игровые деньги)</Label>
                      <Input
                        type="number"
                        value={editingCase.price_money}
                        onChange={(e) => setEditingCase({ ...editingCase, price_money: parseInt(e.target.value) || 0 })}
                        className="bg-black/60 border-white/10"
                      />
                    </div>
                    <div>
                      <Label>Цена (донат)</Label>
                      <Input
                        type="number"
                        value={editingCase.price_donate}
                        onChange={(e) => setEditingCase({ ...editingCase, price_donate: parseInt(e.target.value) || 0 })}
                        className="bg-black/60 border-white/10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleUpdateCase} disabled={loading}>
                      <Icon name="Check" size={16} className="mr-1" />
                      Сохранить
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingCase(null)}>
                      <Icon name="X" size={16} className="mr-1" />
                      Отмена
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card key={caseItem.case_id} className="bg-black/40 p-4 border-white/10 hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold">{caseItem.case_name}</div>
                    <div className="text-sm text-gray-400">
                      💰 {caseItem.price_money} | 💎 {caseItem.price_donate}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setEditingCase(caseItem)}>
                    <Icon name="Edit" size={16} />
                  </Button>
                </div>
              </Card>
            )
          ))}
        </div>
      </Card>

      <Card className="bg-black/60 backdrop-blur-md border-primary/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Icon name="Package" size={24} className="text-primary" />
            Предметы и редкость ({filteredItems.length})
          </h3>
          <Input
            placeholder="Поиск предмета..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-xs bg-black/40 border-white/10"
          />
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Название</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Цена продажи</TableHead>
                <TableHead>Шанс выпадения (%)</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.slice(0, 50).map((item) => (
                editingItem?.loot_id === item.loot_id ? (
                  <TableRow key={item.loot_id} className="bg-primary/10">
                    <TableCell>{item.loot_id}</TableCell>
                    <TableCell>{item.loot_name}</TableCell>
                    <TableCell>{item.loot_type}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={editingItem.loot_price}
                        onChange={(e) => setEditingItem({ ...editingItem, loot_price: parseInt(e.target.value) || 0 })}
                        className="w-24 bg-black/60 border-white/10"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.1"
                        value={editingItem.drop_chance}
                        onChange={(e) => setEditingItem({ ...editingItem, drop_chance: parseFloat(e.target.value) || 1 })}
                        className="w-24 bg-black/60 border-white/10"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" onClick={handleUpdateItem} disabled={loading}>
                          <Icon name="Check" size={14} />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingItem(null)}>
                          <Icon name="X" size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow key={item.loot_id}>
                    <TableCell>{item.loot_id}</TableCell>
                    <TableCell>{item.loot_name}</TableCell>
                    <TableCell>{item.loot_type}</TableCell>
                    <TableCell>{item.loot_price || 0}₽</TableCell>
                    <TableCell>{item.drop_chance || 1.0}%</TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={() => setEditingItem(item)}>
                        <Icon name="Edit" size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              ))}
            </TableBody>
          </Table>
        </div>
        
        {filteredItems.length > 50 && (
          <div className="text-center text-sm text-gray-500 mt-4">
            Показано 50 из {filteredItems.length} предметов
          </div>
        )}
      </Card>
    </div>
  );
};

export default CasesManagement;