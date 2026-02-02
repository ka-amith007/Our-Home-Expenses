import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Expense } from '@/lib/constants';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend } from 'recharts';

interface ExpenseChartsProps {
  expenses: Expense[];
  categories: string[];
  roommates: string[];
  currency: string;
}

const CATEGORY_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#6b7280', // gray
];

const PERSON_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export function ExpenseCharts({ expenses, categories, roommates, currency }: ExpenseChartsProps) {
  // Category breakdown
  const categoryData = categories.map((cat, index) => ({
    name: cat,
    value: expenses
      .filter(e => e.category === cat)
      .reduce((sum, e) => sum + e.amount, 0),
    fill: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  })).filter(d => d.value > 0);

  // Monthly spending by person
  const months = [...new Set(expenses.map(e => e.month))].sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateA.getTime() - dateB.getTime();
  }).slice(-6); // Last 6 months

  const monthlyData = months.map(month => {
    const data: Record<string, string | number> = { month };
    roommates.forEach(person => {
      data[person] = expenses
        .filter(e => e.month === month && e.paid_by === person)
        .reduce((sum, e) => sum + e.amount, 0);
    });
    return data;
  });

  // Per-person total
  const personData = roommates.map((person, index) => ({
    name: person,
    value: expenses
      .filter(e => e.paid_by === person)
      .reduce((sum, e) => sum + e.amount, 0),
    fill: PERSON_COLORS[index % PERSON_COLORS.length],
  }));

  const formatAmount = (value: number) => `${currency}${value.toLocaleString('en-IN')}`;

  const chartConfig = categories.reduce((acc, cat, index) => {
    acc[cat] = { label: cat, color: CATEGORY_COLORS[index % CATEGORY_COLORS.length] };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  const personChartConfig = roommates.reduce((acc, person, index) => {
    acc[person] = { label: person, color: PERSON_COLORS[index % PERSON_COLORS.length] };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  if (expenses.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
      {/* Category Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px]">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip 
                content={<ChartTooltipContent formatter={(value) => formatAmount(value as number)} />} 
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Monthly Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Spending by Person</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={personChartConfig} className="h-[250px]">
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `${currency}${v / 1000}k`} tick={{ fontSize: 11 }} />
              <ChartTooltip 
                content={<ChartTooltipContent formatter={(value) => formatAmount(value as number)} />} 
              />
              {roommates.map((person, index) => (
                <Bar 
                  key={person}
                  dataKey={person} 
                  fill={PERSON_COLORS[index % PERSON_COLORS.length]}
                  stackId="a"
                />
              ))}
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Person Contribution Pie */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Total Contribution by Person</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={personChartConfig} className="h-[250px]">
            <PieChart>
              <Pie
                data={personData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {personData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip 
                content={<ChartTooltipContent formatter={(value) => formatAmount(value as number)} />} 
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
