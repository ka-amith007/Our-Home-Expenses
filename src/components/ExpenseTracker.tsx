import { useState, useMemo } from 'react';
import { SummaryCards } from './SummaryCards';
import { ExpenseFilters } from './ExpenseFilters';
import { ExpenseTable } from './ExpenseTable';
import { ExpenseCharts } from './ExpenseCharts';
import { SettingsDialog } from './SettingsDialog';
import { ProfileCards } from './ProfileCards';
import { Logo } from './Logo';
import { useExpenses } from '@/hooks/useExpenses';
import { useSettings } from '@/hooks/useSettings';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { useState as useThemeState } from 'react';

export function ExpenseTracker() {
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses();
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const { isAdmin, signOut, user } = useAuth();

  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [paidByFilter, setPaidByFilter] = useState('all');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isDark, setIsDark] = useThemeState(false);

  const roommates = settings?.roommates || ['Amith', 'Anusha'];
  const categories = settings?.categories || ['Rent', 'Food', 'Electricity', 'Internet', 'Groceries', 'Others'];
  const currency = settings?.currency || '₹';
  const largeExpenseThreshold = settings?.large_expense_threshold || 5000;

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesSearch = search === '' || 
        expense.description.toLowerCase().includes(search.toLowerCase()) ||
        expense.category.toLowerCase().includes(search.toLowerCase()) ||
        expense.paid_by.toLowerCase().includes(search.toLowerCase());
      
      const matchesMonth = monthFilter === 'all' || expense.month === monthFilter;
      const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
      const matchesPaidBy = paidByFilter === 'all' || expense.paid_by === paidByFilter;
      
      return matchesSearch && matchesMonth && matchesCategory && matchesPaidBy;
    });
  }, [expenses, search, monthFilter, categoryFilter, paidByFilter]);

  // Export to CSV
  const handleExport = () => {
    const headers = ['Date', 'Description', 'Category', 'Amount', 'Paid By', 'Month'];
    const rows = filteredExpenses.map(e => [
      e.date,
      e.description,
      e.category,
      e.amount.toString(),
      e.paid_by,
      e.month,
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  if (expensesLoading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground font-medium">Loading expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary/3 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="text-center mb-10 animate-fade-in">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-2">
            Our Home Expenses
          </h1>
          <p className="text-muted-foreground font-medium">
            Managed by Amith & Anusha
          </p>
          
          {/* User controls */}
          <div className="flex items-center justify-center gap-3 mt-5">
            <span className="text-sm text-muted-foreground px-3 py-1.5 bg-muted rounded-full">
              {user?.email}
              {isAdmin && (
                <span className="ml-2 text-primary font-semibold">Manager</span>
              )}
            </span>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full h-9 w-9 hover:bg-muted"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="rounded-full gap-2 hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>

        {/* Profile Cards */}
        <section 
          className="mb-10 animate-fade-in" 
          style={{ animationDelay: '0.1s' }}
        >
          <ProfileCards isAdmin={isAdmin} />
        </section>

        {/* Summary Cards */}
        <section 
          className="animate-fade-in" 
          style={{ animationDelay: '0.2s' }}
        >
          <SummaryCards 
            expenses={expenses}
            roommates={roommates}
            currency={currency}
            selectedMonth={monthFilter}
          />
        </section>

        {/* Filters */}
        <section 
          className="animate-fade-in" 
          style={{ animationDelay: '0.3s' }}
        >
          <ExpenseFilters
            expenses={expenses}
            search={search}
            setSearch={setSearch}
            monthFilter={monthFilter}
            setMonthFilter={setMonthFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            paidByFilter={paidByFilter}
            setPaidByFilter={setPaidByFilter}
            categories={categories}
            roommates={roommates}
            onExport={handleExport}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        </section>

        {/* Expense Table */}
        <section 
          className="animate-fade-in" 
          style={{ animationDelay: '0.4s' }}
        >
          <ExpenseTable
            expenses={filteredExpenses}
            categories={categories}
            roommates={roommates}
            currency={currency}
            largeExpenseThreshold={largeExpenseThreshold}
          />
        </section>

        {/* Charts */}
        <section 
          className="animate-fade-in" 
          style={{ animationDelay: '0.5s' }}
        >
          <ExpenseCharts
            expenses={expenses}
            categories={categories}
            roommates={roommates}
            currency={currency}
          />
        </section>

        {/* Settings Dialog */}
        {settings && (
          <SettingsDialog
            open={settingsOpen}
            onOpenChange={setSettingsOpen}
            settings={settings}
          />
        )}
      </div>
    </div>
  );
}
