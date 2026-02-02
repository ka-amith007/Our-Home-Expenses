import { Card, CardContent } from '@/components/ui/card';
import { Expense } from '@/lib/constants';
import { Wallet, Users, Calculator, ArrowRightLeft } from 'lucide-react';

interface SummaryCardsProps {
  expenses: Expense[];
  roommates: string[];
  currency: string;
  selectedMonth: string;
}

export function SummaryCards({ expenses, roommates, currency, selectedMonth }: SummaryCardsProps) {
  // Filter expenses for selected month
  const monthExpenses = selectedMonth === 'all' 
    ? expenses 
    : expenses.filter(e => e.month === selectedMonth);

  // Calculate total spent
  const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Calculate per-person spending
  const perPersonSpending = roommates.reduce((acc, person) => {
    acc[person] = monthExpenses
      .filter(e => e.paid_by === person)
      .reduce((sum, e) => sum + e.amount, 0);
    return acc;
  }, {} as Record<string, number>);

  // Calculate equal split
  const equalSplit = totalSpent / (roommates.length || 1);

  // Calculate settlements (who owes whom)
  const settlements: { from: string; to: string; amount: number }[] = [];
  const balances = roommates.map(person => ({
    person,
    balance: perPersonSpending[person] - equalSplit,
  }));

  const debtors = balances.filter(b => b.balance < 0).sort((a, b) => a.balance - b.balance);
  const creditors = balances.filter(b => b.balance > 0).sort((a, b) => b.balance - a.balance);

  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(-debtor.balance, creditor.balance);
    
    if (amount > 0.01) {
      settlements.push({
        from: debtor.person,
        to: creditor.person,
        amount: Math.round(amount * 100) / 100,
      });
    }
    
    debtor.balance += amount;
    creditor.balance -= amount;
    
    if (Math.abs(debtor.balance) < 0.01) i++;
    if (Math.abs(creditor.balance) < 0.01) j++;
  }

  const formatAmount = (amount: number) => {
    const formatted = amount.toLocaleString('en-IN', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    });
    return (
      <span className="tabular-nums">
        <span className="font-bold">{currency}</span>
        <span className="font-semibold">{formatted}</span>
      </span>
    );
  };

  const cards = [
    {
      title: 'Total Spent',
      icon: Wallet,
      content: (
        <div className="text-3xl text-foreground">
          {formatAmount(totalSpent)}
        </div>
      ),
      subtitle: selectedMonth === 'all' ? 'All time' : selectedMonth,
      accent: 'bg-primary/10 text-primary',
    },
    {
      title: 'Per Person Spending',
      icon: Users,
      content: (
        <div className="space-y-2">
          {roommates.map((person) => (
            <div key={person} className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">{person}</span>
              <span className="text-lg">{formatAmount(perPersonSpending[person] || 0)}</span>
            </div>
          ))}
        </div>
      ),
      accent: 'bg-info/10 text-info',
    },
    {
      title: 'Equal Split',
      icon: Calculator,
      content: (
        <div className="text-3xl text-foreground">
          {formatAmount(Math.round(equalSplit))}
        </div>
      ),
      subtitle: 'per person',
      accent: 'bg-success/10 text-success',
    },
    {
      title: 'Settlement',
      icon: ArrowRightLeft,
      content: settlements.length === 0 ? (
        <p className="text-success font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success" />
          All settled!
        </p>
      ) : (
        <div className="space-y-2">
          {settlements.map((s, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <span className="font-medium text-foreground">{s.from}</span>
              <ArrowRightLeft className="w-3 h-3 text-muted-foreground" />
              <span className="font-medium text-foreground">{s.to}</span>
              <span className="ml-auto text-primary font-semibold">
                {formatAmount(s.amount)}
              </span>
            </div>
          ))}
        </div>
      ),
      accent: 'bg-anusha/10 text-anusha',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, index) => (
        <Card 
          key={card.title}
          className="bg-card border border-border/50 shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden"
          style={{
            animationDelay: `${index * 50}ms`,
          }}
        >
          <CardContent className="p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                {card.title}
              </h3>
              <div className={`p-2 rounded-lg ${card.accent}`}>
                <card.icon className="h-4 w-4" strokeWidth={2} />
              </div>
            </div>

            {/* Content */}
            <div className="min-h-[48px] flex flex-col justify-center">
              {card.content}
            </div>

            {/* Subtitle */}
            {card.subtitle && (
              <p className="text-xs text-muted-foreground mt-2 font-medium">
                {card.subtitle}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
