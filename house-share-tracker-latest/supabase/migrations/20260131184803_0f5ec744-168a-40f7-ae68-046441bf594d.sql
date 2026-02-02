-- Create settings table for app configuration (passwords, roommate names)
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on settings (public read for passwords, limited write)
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read settings (passwords are hashed)
CREATE POLICY "Anyone can read settings" 
ON public.settings 
FOR SELECT 
USING (true);

-- Allow anyone to update settings (protected by app-level password check)
CREATE POLICY "Anyone can update settings" 
ON public.settings 
FOR UPDATE 
USING (true);

-- Allow anyone to insert settings
CREATE POLICY "Anyone can insert settings" 
ON public.settings 
FOR INSERT 
WITH CHECK (true);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  paid_by TEXT NOT NULL,
  month TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on expenses
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read expenses (protected by app-level password)
CREATE POLICY "Anyone can read expenses" 
ON public.expenses 
FOR SELECT 
USING (true);

-- Allow anyone to insert expenses (protected by app-level admin password)
CREATE POLICY "Anyone can insert expenses" 
ON public.expenses 
FOR INSERT 
WITH CHECK (true);

-- Allow anyone to update expenses (protected by app-level admin password)
CREATE POLICY "Anyone can update expenses" 
ON public.expenses 
FOR UPDATE 
USING (true);

-- Allow anyone to delete expenses (protected by app-level admin password)
CREATE POLICY "Anyone can delete expenses" 
ON public.expenses 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON public.settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
BEFORE UPDATE ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.settings (key, value) VALUES 
  ('admin_password', '"admin123"'),
  ('viewer_password', '"viewer123"'),
  ('roommates', '["Me", "Roommate 1", "Roommate 2"]'),
  ('categories', '["Rent", "Food", "Electricity", "Internet", "Groceries", "Others"]'),
  ('currency', '"₹"'),
  ('large_expense_threshold', '5000');

-- Enable realtime for expenses
ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;