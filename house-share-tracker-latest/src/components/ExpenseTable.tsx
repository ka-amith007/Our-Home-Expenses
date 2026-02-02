import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Expense, LARGE_EXPENSE_THRESHOLD } from '@/lib/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateExpense, useUpdateExpense, useDeleteExpense, getMonthFromDate } from '@/hooks/useExpenses';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ExpenseTableProps {
  expenses: Expense[];
  categories: string[];
  roommates: string[];
  currency: string;
  largeExpenseThreshold: number;
}

interface EditingRow {
  id: string | 'new';
  date: string;
  description: string;
  category: string;
  amount: string;
  paid_by: string;
}

export function ExpenseTable({ 
  expenses, 
  categories, 
  roommates, 
  currency,
  largeExpenseThreshold 
}: ExpenseTableProps) {
  const { isAdmin } = useAuth();
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

  const [editingRow, setEditingRow] = useState<EditingRow | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  const dateInputRef = useRef<HTMLInputElement>(null);
  const descInputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);

  const today = format(new Date(), 'yyyy-MM-dd');

  const startAddNew = () => {
    setIsAdding(true);
    setEditingRow({
      id: 'new',
      date: today,
      description: '',
      category: categories[0] || 'Others',
      amount: '',
      paid_by: roommates[0] || 'Me',
    });
    setTimeout(() => descInputRef.current?.focus(), 50);
  };

  const startEdit = (expense: Expense) => {
    setEditingRow({
      id: expense.id,
      date: expense.date,
      description: expense.description,
      category: expense.category,
      amount: expense.amount.toString(),
      paid_by: expense.paid_by,
    });
    setTimeout(() => descInputRef.current?.focus(), 50);
  };

  const cancelEdit = () => {
    setEditingRow(null);
    setIsAdding(false);
  };

  const saveRow = async () => {
    if (!editingRow) return;
    
    const amount = parseFloat(editingRow.amount);
    if (!editingRow.description.trim() || isNaN(amount) || amount <= 0) {
      return;
    }

    const expenseData = {
      date: editingRow.date,
      description: editingRow.description.trim(),
      category: editingRow.category,
      amount,
      paid_by: editingRow.paid_by,
      month: getMonthFromDate(editingRow.date),
    };

    if (editingRow.id === 'new') {
      await createExpense.mutateAsync(expenseData);
    } else {
      await updateExpense.mutateAsync({ id: editingRow.id, expense: expenseData });
    }
    
    setEditingRow(null);
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this expense?')) {
      await deleteExpense.mutateAsync(id);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveRow();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  // Calculate total
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const formatAmount = (amount: number) => 
    `${currency}${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const isLargeExpense = (amount: number) => amount >= largeExpenseThreshold;

  return (
    <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
      {/* Add button for admin */}
      {isAdmin && !isAdding && (
        <div className="p-3 border-b bg-muted/30">
          <Button onClick={startAddNew} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Expense
          </Button>
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="w-[120px]">Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[130px]">Category</TableHead>
              <TableHead className="w-[120px] text-right">Amount</TableHead>
              <TableHead className="w-[130px]">Paid By</TableHead>
              <TableHead className="w-[100px]">Month</TableHead>
              {isAdmin && <TableHead className="w-[90px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* New expense row */}
            {isAdding && editingRow && (
              <TableRow className="bg-primary/5">
                <TableCell>
                  <Input
                    ref={dateInputRef}
                    type="date"
                    value={editingRow.date}
                    onChange={(e) => setEditingRow({ ...editingRow, date: e.target.value })}
                    onKeyDown={handleKeyDown}
                    className="h-8"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    ref={descInputRef}
                    value={editingRow.description}
                    onChange={(e) => setEditingRow({ ...editingRow, description: e.target.value })}
                    onKeyDown={handleKeyDown}
                    placeholder="Description"
                    className="h-8"
                  />
                </TableCell>
                <TableCell>
                  <Select 
                    value={editingRow.category} 
                    onValueChange={(v) => setEditingRow({ ...editingRow, category: v })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    ref={amountInputRef}
                    type="number"
                    value={editingRow.amount}
                    onChange={(e) => setEditingRow({ ...editingRow, amount: e.target.value })}
                    onKeyDown={handleKeyDown}
                    placeholder="0"
                    className="h-8 text-right"
                  />
                </TableCell>
                <TableCell>
                  <Select 
                    value={editingRow.paid_by} 
                    onValueChange={(v) => setEditingRow({ ...editingRow, paid_by: v })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roommates.map(person => (
                        <SelectItem key={person} value={person}>{person}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {getMonthFromDate(editingRow.date)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={saveRow}>
                      <Check className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={cancelEdit}>
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* Expense rows */}
            {expenses.map((expense) => (
              <TableRow 
                key={expense.id}
                className={cn(
                  editingRow?.id === expense.id && 'bg-primary/5'
                )}
              >
                {editingRow?.id === expense.id ? (
                  // Editing mode
                  <>
                    <TableCell>
                      <Input
                        type="date"
                        value={editingRow.date}
                        onChange={(e) => setEditingRow({ ...editingRow, date: e.target.value })}
                        onKeyDown={handleKeyDown}
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        ref={descInputRef}
                        value={editingRow.description}
                        onChange={(e) => setEditingRow({ ...editingRow, description: e.target.value })}
                        onKeyDown={handleKeyDown}
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={editingRow.category} 
                        onValueChange={(v) => setEditingRow({ ...editingRow, category: v })}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={editingRow.amount}
                        onChange={(e) => setEditingRow({ ...editingRow, amount: e.target.value })}
                        onKeyDown={handleKeyDown}
                        className="h-8 text-right"
                      />
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={editingRow.paid_by} 
                        onValueChange={(v) => setEditingRow({ ...editingRow, paid_by: v })}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roommates.map(person => (
                            <SelectItem key={person} value={person}>{person}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {getMonthFromDate(editingRow.date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={saveRow}>
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={cancelEdit}>
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </>
                ) : (
                  // View mode
                  <>
                    <TableCell className="font-mono text-sm">
                      {format(new Date(expense.date), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell className="font-medium">{expense.description}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-muted">
                        {expense.category}
                      </span>
                    </TableCell>
                    <TableCell className={cn(
                      "text-right font-medium tabular-nums",
                      isLargeExpense(expense.amount) && "text-orange-600 font-bold"
                    )}>
                      {formatAmount(expense.amount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{expense.paid_by}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{expense.month}</TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-7 w-7"
                            onClick={() => startEdit(expense)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(expense.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </>
                )}
              </TableRow>
            ))}

            {/* Empty state */}
            {expenses.length === 0 && !isAdding && (
              <TableRow>
                <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-12 text-muted-foreground">
                  No expenses found. {isAdmin && 'Click "Add Expense" to get started.'}
                </TableCell>
              </TableRow>
            )}

            {/* Total row */}
            {expenses.length > 0 && (
              <TableRow className="bg-muted/50 font-medium border-t-2">
                <TableCell colSpan={3} className="text-right">
                  Total ({expenses.length} items)
                </TableCell>
                <TableCell className="text-right font-bold text-lg tabular-nums">
                  {formatAmount(total)}
                </TableCell>
                <TableCell colSpan={isAdmin ? 3 : 2}></TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
