import { Home, IndianRupee } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = false }: LogoProps) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  };

  const badgeSizes = {
    sm: 'w-4 h-4 -bottom-0.5 -right-0.5',
    md: 'w-5 h-5 -bottom-1 -right-1',
    lg: 'w-7 h-7 -bottom-1.5 -right-1.5',
  };

  const badgeIconSizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        {/* Main logo container */}
        <div 
          className={`${sizeClasses[size]} rounded-2xl gradient-primary flex items-center justify-center shadow-elevated`}
          style={{
            boxShadow: '0 8px 30px -6px rgba(30, 41, 59, 0.25), 0 4px 12px -4px rgba(30, 41, 59, 0.15)',
          }}
        >
          <Home className={`${iconSizes[size]} text-primary-foreground`} strokeWidth={2.5} />
        </div>
        
        {/* Currency badge */}
        <div 
          className={`absolute ${badgeSizes[size]} rounded-full gradient-gold flex items-center justify-center shadow-lg ring-2 ring-background`}
          style={{
            boxShadow: '0 2px 8px rgba(250, 204, 21, 0.4)',
          }}
        >
          <IndianRupee className={`${badgeIconSizes[size]} text-white`} strokeWidth={3} />
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="text-lg font-bold text-foreground tracking-tight">Our Home</span>
          <span className="text-xs text-muted-foreground font-medium -mt-0.5">Expenses</span>
        </div>
      )}
    </div>
  );
}
