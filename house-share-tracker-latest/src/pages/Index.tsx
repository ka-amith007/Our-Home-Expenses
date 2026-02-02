import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AuthScreen } from '@/components/AuthScreen';
import { ExpenseTracker } from '@/components/ExpenseTracker';

function IndexContent() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <AuthScreen />;
  }
  
  return <ExpenseTracker />;
}

const Index = () => {
  return (
    <AuthProvider>
      <IndexContent />
    </AuthProvider>
  );
};

export default Index;
