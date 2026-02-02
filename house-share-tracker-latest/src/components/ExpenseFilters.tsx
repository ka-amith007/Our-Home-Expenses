import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Download, Settings, X } from 'lucide-react';
import { Expense } from '@/lib/constants';
import { useAuth } from '@/contexts/AuthContext';

interface ExpenseFiltersProps {
  expenses: Expense[];
  search: string;
  setSearch: (value: string) => void;
  monthFilter: string;
  setMonthFilter: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  paidByFilter: string;
  setPaidByFilter: (value: string) => void;
  categories: string[];
  roommates: string[];
  onExport: () => void;
  onOpenSettings: () => void;
}

export function ExpenseFilters({
  expenses,
  search,
  setSearch,
  monthFilter,
  setMonthFilter,
  categoryFilter,
  setCategoryFilter,
  paidByFilter,
  setPaidByFilter,
  categories,
  roommates,
  onExport,
  onOpenSettings,
}: ExpenseFiltersProps) {
  const { isAdmin, role } = useAuth();
  
  // Get unique months from expenses
  const months = [...new Set(expenses.map(e => e.month))].sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateB.getTime() - dateA.getTime();
  });

  const clearFilters = () => {
    setSearch('');
    setMonthFilter('all');
    setCategoryFilter('all');
    setPaidByFilter('all');
  };

  const hasFilters = search || monthFilter !== 'all' || categoryFilter !== 'all' || paidByFilter !== 'all';

  return (
    <div className="space-y-4 mb-6">
      {/* Top row: Search and actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {isAdmin && (
            <Button variant="outline" onClick={onOpenSettings}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          )}
        </div>
      </div>

      {/* User role badge */}
      <div className="flex items-center gap-2">
        <span className={`text-xs px-2 py-1 rounded-full ${
          isAdmin ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
        }`}>
          {isAdmin ? '👑 Manager' : '👁 Viewer'}
        </span>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap gap-3">
        <Select value={monthFilter} onValueChange={setMonthFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            {months.map(month => (
              <SelectItem key={month} value={month}>{month}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={paidByFilter} onValueChange={setPaidByFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Paid By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All People</SelectItem>
            {roommates.map(person => (
              <SelectItem key={person} value={person}>{person}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
