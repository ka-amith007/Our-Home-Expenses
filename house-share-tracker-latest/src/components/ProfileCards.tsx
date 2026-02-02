import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, Eye, User } from 'lucide-react';

interface ProfileCardsProps {
  isAdmin: boolean;
}

export function ProfileCards({ isAdmin }: ProfileCardsProps) {
  const profiles = [
    {
      name: 'Amith',
      role: 'Manager',
      isManager: true,
      avatarUrl: '/assets/amith.png',
      avatarBg: 'bg-primary',
      cardBg: 'bg-gradient-to-br from-primary/5 via-primary/3 to-transparent',
      borderColor: 'border-primary/10 hover:border-primary/20',
      roleColor: 'text-primary',
    },
    {
      name: 'Anusha',
      role: 'Viewer',
      isManager: false,
      avatarUrl: '/assets/anusha.png',
      avatarBg: 'bg-anusha',
      cardBg: 'bg-gradient-to-br from-anusha/5 via-anusha/3 to-transparent',
      borderColor: 'border-anusha/10 hover:border-anusha/20',
      roleColor: 'text-anusha',
    },
  ];

  return (
    <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
      {profiles.map((profile, index) => (
        <Card
          key={profile.name}
          className={`
            relative overflow-hidden px-8 py-6 
            ${profile.cardBg} 
            ${profile.borderColor}
            bg-card
            shadow-soft hover:shadow-medium
            transition-all duration-300 
            hover:-translate-y-1
            cursor-default
            min-w-[160px]
          `}
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        >
          <div className="relative flex flex-col items-center text-center">
            {/* Avatar with proper styling */}
            <div className="relative">
              <Avatar className="w-20 h-20 ring-4 ring-background shadow-medium">
                <AvatarImage src={profile.avatarUrl} alt={profile.name} />
                <AvatarFallback
                  className={`
                    text-2xl font-bold text-white
                    ${profile.avatarBg}
                  `}
                >
                  {profile.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              {/* Role indicator badge */}
              <div
                className={`
                  absolute -bottom-1 -right-1 
                  w-8 h-8 rounded-full 
                  flex items-center justify-center 
                  ring-3 ring-background
                  ${profile.isManager
                    ? 'gradient-gold shadow-glow-gold'
                    : 'bg-muted-foreground/80'
                  }
                `}
                style={{
                  boxShadow: profile.isManager
                    ? '0 2px 12px rgba(250, 204, 21, 0.5)'
                    : '0 2px 8px rgba(0, 0, 0, 0.15)',
                }}
              >
                {profile.isManager ? (
                  <Crown className="w-4 h-4 text-white" strokeWidth={2.5} />
                ) : (
                  <Eye className="w-4 h-4 text-white" strokeWidth={2.5} />
                )}
              </div>
            </div>

            {/* Name */}
            <h3 className="mt-4 text-lg font-semibold text-foreground tracking-tight">
              {profile.name}
            </h3>

            {/* Role */}
            <p className={`text-sm font-medium ${profile.roleColor}`}>
              {profile.role}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
