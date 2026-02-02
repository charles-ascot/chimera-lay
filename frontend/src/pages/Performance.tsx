import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Calendar,
  Target,
} from 'lucide-react';
import { Card, StatCard, Badge } from '../components/ui';
import { cn, formatCurrency } from '../utils';

const weeklyData = [
  { week: 'W1', pl: 2850, bets: 45, winRate: 68 },
  { week: 'W2', pl: -1200, bets: 42, winRate: 62 },
  { week: 'W3', pl: 3400, bets: 48, winRate: 71 },
  { week: 'W4', pl: 1900, bets: 38, winRate: 66 },
];

const monthlyEquity = [
  { month: 'Jan', value: 100000 },
  { month: 'Feb', value: 102500 },
  { month: 'Mar', value: 101200 },
  { month: 'Apr', value: 105800 },
  { month: 'May', value: 108200 },
  { month: 'Jun', value: 107500 },
  { month: 'Jul', value: 112300 },
  { month: 'Aug', value: 115600 },
  { month: 'Sep', value: 114200 },
  { month: 'Oct', value: 118900 },
  { month: 'Nov', value: 122500 },
  { month: 'Dec', value: 126800 },
];

const coursePerformance = [
  { course: 'Cheltenham', pl: 4520, bets: 85, winRate: 72 },
  { course: 'Leopardstown', pl: 3890, bets: 72, winRate: 69 },
  { course: 'Ascot', pl: 2150, bets: 65, winRate: 65 },
  { course: 'Newmarket', pl: -850, bets: 58, winRate: 58 },
  { course: 'York', pl: 1780, bets: 45, winRate: 67 },
  { course: 'Sandown', pl: 2340, bets: 52, winRate: 70 },
];

export const Performance: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-semibold text-track-100">
          Performance Analytics
        </h1>
        <p className="text-track-400 mt-1">
          Detailed analysis of your trading performance
        </p>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Profit"
          value={formatCurrency(26800)}
          change={26.8}
          changeLabel="all time"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          title="This Month"
          value={formatCurrency(4300)}
          change={3.5}
          icon={<Calendar className="w-5 h-5" />}
        />
        <StatCard
          title="Win Rate"
          value="68.5%"
          icon={<Target className="w-5 h-5" />}
        />
        <StatCard
          title="ROI"
          value="+5.2%"
          icon={<TrendingUp className="w-5 h-5" />}
        />
      </div>
      
      {/* Equity Chart */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-track-100">Equity Curve</h3>
            <p className="text-sm text-track-400">Portfolio value over 2024</p>
          </div>
          <Badge variant="success">+26.8% YTD</Badge>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyEquity}>
              <defs>
                <linearGradient id="perfGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis dataKey="month" stroke="#71717a" tick={{ fontSize: 12 }} />
              <YAxis
                stroke="#71717a"
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#27272a',
                  border: '1px solid #3f3f46',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [formatCurrency(value), 'Balance']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#perfGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
      
      {/* Weekly Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-track-100">Weekly P&L</h3>
            <p className="text-sm text-track-400">Last 4 weeks performance</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis dataKey="week" stroke="#71717a" tick={{ fontSize: 12 }} />
                <YAxis
                  stroke="#71717a"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => `£${v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#27272a',
                    border: '1px solid #3f3f46',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'P&L']}
                />
                <Bar dataKey="pl" radius={[4, 4, 0, 0]}>
                  {weeklyData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.pl >= 0 ? '#22c55e' : '#ef4444'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-track-100">Course Performance</h3>
            <p className="text-sm text-track-400">P&L by racecourse</p>
          </div>
          <div className="space-y-3">
            {coursePerformance.map((course) => (
              <div
                key={course.course}
                className="flex items-center justify-between p-3 bg-track-800/50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-track-100">{course.course}</p>
                  <p className="text-sm text-track-400">
                    {course.bets} bets • {course.winRate}% win rate
                  </p>
                </div>
                <span
                  className={cn(
                    'font-mono font-semibold',
                    course.pl >= 0 ? 'text-profit' : 'text-loss'
                  )}
                >
                  {formatCurrency(course.pl)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
