-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Anyone authenticated can view profiles" ON public.profiles;

-- Create a policy that only allows users to view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);