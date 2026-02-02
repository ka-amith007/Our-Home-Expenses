import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Expense } from '@/lib/constants';
import { format } from 'date-fns';
import { useEffect } from 'react';

async function fetchExpenses(): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false });

  if (error) throw error;
  
  return (data || []).map(row => ({
    ...row,
    amount: Number(row.amount),
  }));
}

async function createExpense(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .insert(expense)
    .select()
    .single();

  if (error) throw error;
  return { ...data, amount: Number(data.amount) };
}

async function updateExpense(id: string, expense: Partial<Expense>): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .update(expense)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return { ...data, amount: Number(data.amount) };
}

async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export function useExpenses() {
  const queryClient = useQueryClient();

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('expenses-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['expenses'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['expenses'],
    queryFn: fetchExpenses,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) => 
      createExpense(expense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, expense }: { id: string; expense: Partial<Expense> }) => 
      updateExpense(id, expense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}

export function getMonthFromDate(dateStr: string): string {
  const date = new Date(dateStr);
  return format(date, 'MMM yyyy');
}
