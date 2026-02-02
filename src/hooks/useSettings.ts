import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Settings } from '@/lib/constants';

async function fetchSettings(): Promise<Settings> {
  const { data, error } = await supabase
    .from('settings')
    .select('key, value');

  if (error) throw error;

  const settings: Settings = {
    roommates: ['Amith', 'Anusha'],
    categories: ['Rent', 'Food', 'Electricity', 'Internet', 'Groceries', 'Others'],
    currency: '₹',
    large_expense_threshold: 5000,
  };

  data?.forEach((row) => {
    const key = row.key as keyof Settings;
    switch (key) {
      case 'roommates':
        settings.roommates = row.value as string[];
        break;
      case 'categories':
        settings.categories = row.value as string[];
        break;
      case 'currency':
        settings.currency = row.value as string;
        break;
      case 'large_expense_threshold':
        settings.large_expense_threshold = row.value as number;
        break;
    }
  });

  return settings;
}

async function updateSetting(key: string, value: unknown): Promise<void> {
  const { error } = await supabase
    .from('settings')
    .update({ value: JSON.stringify(value) })
    .eq('key', key);

  if (error) throw error;
}

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: unknown }) => 
      updateSetting(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}
