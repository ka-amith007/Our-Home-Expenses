import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings } from '@/lib/constants';
import { useUpdateSetting } from '@/hooks/useSettings';
import { Plus, X, Save, Info } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: Settings;
}

export function SettingsDialog({ open, onOpenChange, settings }: SettingsDialogProps) {
  const updateSetting = useUpdateSetting();
  
  const [roommates, setRoommates] = useState<string[]>(settings.roommates);
  const [newRoommate, setNewRoommate] = useState('');
  const [categories, setCategories] = useState<string[]>(settings.categories);
  const [newCategory, setNewCategory] = useState('');
  const [currency, setCurrency] = useState(settings.currency);
  const [threshold, setThreshold] = useState(settings.large_expense_threshold.toString());

  useEffect(() => {
    setRoommates(settings.roommates);
    setCategories(settings.categories);
    setCurrency(settings.currency);
    setThreshold(settings.large_expense_threshold.toString());
  }, [settings]);

  const addRoommate = () => {
    if (newRoommate.trim() && !roommates.includes(newRoommate.trim())) {
      setRoommates([...roommates, newRoommate.trim()]);
      setNewRoommate('');
    }
  };

  const removeRoommate = (name: string) => {
    if (roommates.length > 1) {
      setRoommates(roommates.filter(r => r !== name));
    }
  };

  const addCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory('');
    }
  };

  const removeCategory = (name: string) => {
    if (categories.length > 1) {
      setCategories(categories.filter(c => c !== name));
    }
  };

  const saveAll = async () => {
    try {
      await Promise.all([
        updateSetting.mutateAsync({ key: 'roommates', value: roommates }),
        updateSetting.mutateAsync({ key: 'categories', value: categories }),
        updateSetting.mutateAsync({ key: 'currency', value: currency }),
        updateSetting.mutateAsync({ key: 'large_expense_threshold', value: parseInt(threshold) || 5000 }),
      ]);
      toast.success('Settings saved successfully!');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="people" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="people">People & Display</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="people" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Roommates</Label>
              <div className="flex flex-wrap gap-2">
                {roommates.map((name) => (
                  <div 
                    key={name} 
                    className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full text-sm"
                  >
                    {name}
                    <button 
                      onClick={() => removeRoommate(name)}
                      className="ml-1 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newRoommate}
                  onChange={(e) => setNewRoommate(e.target.value)}
                  placeholder="Add roommate name"
                  onKeyDown={(e) => e.key === 'Enter' && addRoommate()}
                />
                <Button size="icon" onClick={addRoommate}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Currency Symbol</Label>
              <Input
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="₹"
                className="w-20"
              />
            </div>

            <div className="space-y-2">
              <Label>Large Expense Threshold</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{currency}</span>
                <Input
                  type="number"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="w-32"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Expenses above this amount will be highlighted
              </p>
            </div>

            <div className="p-3 rounded-lg bg-muted/50 flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <p className="text-xs text-muted-foreground">
                User roles (Manager/Viewer) are managed through account authentication. Contact an admin to change user roles.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Expense Categories</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((name) => (
                  <div 
                    key={name} 
                    className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full text-sm"
                  >
                    {name}
                    <button 
                      onClick={() => removeCategory(name)}
                      className="ml-1 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Add category"
                  onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                />
                <Button size="icon" onClick={addCategory}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={saveAll} disabled={updateSetting.isPending}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
