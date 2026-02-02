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
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from 'lucide-react';
import { Card, StatCard, Badge, Button } from '../components/ui';
import { cn, formatCurrency, formatPercent } from '../utils';
import { useDashboardStats } from '../hooks';
import type { Bet } from '../types';

const equityCurveData = [
  { date: 'Jan', value: 100000 },
  { date: 'Feb', value: 102500 },
  { date: 'Mar', value: 101200 },
  { date: 'Apr', value: 105800 },
  { date: 'May', value: 108200 },
  { date: 'Jun', value: 107500 },
  { date: 'Jul', value: 112300 },
  { date: 'Aug', value: 115600 },
  { date: 'Sep', value: 114200 },
  { date: 'Oct', value: 118900 },
  { date: 'Nov', value: 122500 },
  { date: 'Dec', value: 126800 },
];

const dailyPLData = [
  { day: 'Mon', profit: 450, loss: -200 },
  { day: 'Tue', profit: 320, loss: -580 },
  { day: 'Wed', profit: 780, loss: -150 },
  { day: 'Thu', profit: 290, loss: -420 },
  { day: 'Fri', profit: 650, loss: -180 },
  { day: 'Sat', profit: 890, loss: -350 },
  { day: 'Sun', profit: 120, loss: -90 },
];

const recentBetsData: Partial<Bet>[] = [
  {
    id: '1',
    race: { courseName: 'Cheltenham', raceTime: '14:30' } as never,
    runner: { horseName: 'Desert Crown' } as never,
    odds: 2.45,
    stake: 250,
    liability: 362.5,
    status: 'settled',
    result: 'won',
    profitLoss: 250,
    placedAt: '2024-12-15T14:30:00Z',
  },
  {
    id: '2',
    race: { courseName: 'Ascot', raceTime: '15:15' } as never,
    runner: { horseName: 'Kinross' } as never,
    odds: 3.2,
    stake: 200,
    liability: 440,
    status: 'settled',
    result: 'lost',
    profitLoss: -440,
    placedAt: '2024-12-15T15:15:00Z',
  },
  {
    id: '3',
    race: { courseName: 'Newmarket', raceTime: '13:45' } as never,
    runner: { horseName: 'Baaeed' } as never,
    odds: 2.1,
    stake: 300,
    liability: 330,
    status: 'settled',
    result: 'won',
    profitLoss: 300,
    placedAt: '2024-12-14T13:45:00Z',
  },
  {
    id: '4',
    race: { courseName: 'York', raceTime: '16:00' } as never,
    runner: { horseName: 'Inspiral' } as never,
    odds: 2.85,
    stake: 180,
    liability: 333,
    status: 'pending',
    result: null,
    profitLoss: null,
    placedAt: '2024-12-16T16:00:00Z',
  },
];

const upcomingRaces = [
  { id: '1', course: 'Kempton', time: '14:00', runners: 8, favorite: 'Energumene', odds: 2.3 },
  { id: '2', course: 'Leopardstown', time: '14:35', runners: 12, favorite: 'Honeysuckle', odds: 2.8 },
  { id: '3', course: 'Sandown', time: '15:10', runners: 10, favorite: 'Shishkin', odds: 3.1 },
  { id: '4', course: 'Chepstow', time: '15:45', runners: 9, favorite: 'Envoi Allen', odds: 2.5 },
];

export const Dashboard: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  
  const mockStats = {
    currentBankroll: 126800,
    todayPL: 540,
    weekPL: 2850,
    monthPL: 7900,
    totalPL: 26800,
    activeBets: 3,
    pendingRaces: 12,
    winRate: 68.5,
    roi: 5.2,
    streak: { type: 'winning' as const, count: 4 },
  };
  
  const displayStats = stats || mockStats;
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-track-100">
            Welcome back, Charles
          </h1>
          <p className="text-track-400 mt-1">
            Here's your trading overview for today
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant={displayStats.streak.type === 'winning' ? 'success' : 'danger'}>
            {displayStats.streak.count} {displayStats.streak.type} streak
          </Badge>
          <Button variant="primary">
            View Qualifying Races
          </Button>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Bankroll"
          value={formatCurrency(displayStats.currentBankroll)}
          change={displayStats.roi}
          changeLabel="all time"
          icon={<Wallet className="w-5 h-5" />}
          loading={statsLoading}
        />
        <StatCard
          title="Today's P&L"
          value={formatCurrency(displayStats.todayPL)}
          change={(displayStats.todayPL / displayStats.currentBankroll) * 100}
          icon={displayStats.todayPL >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          loading={statsLoading}
        />
        <StatCard
          title="Win Rate"
          value={`${displayStats.winRate.toFixed(1)}%`}
          icon={<Target className="w-5 h-5" />}
          loading={statsLoading}
        />
        <StatCard
          title="Active Bets"
          value={displayStats.activeBets}
          icon={<Activity className="w-5 h-5" />}
          loading={statsLoading}
        />
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equity Curve */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-track-100">Equity Curve</h3>
              <p className="text-sm text-track-400">2024 Performance</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-mono font-semibold text-profit">
                +{formatPercent((126800 - 100000) / 100000 * 100)}
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityCurveData}>
                <defs>
                  <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis dataKey="date" stroke="#71717a" tick={{ fontSize: 12 }} />
                <YAxis
                  stroke="#71717a"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`}
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
                  fill="url(#equityGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        {/* Daily P&L */}
        <Card>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-track-100">Weekly P&L</h3>
            <p className="text-sm text-track-400">Profit/Loss by day</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyPLData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis dataKey="day" stroke="#71717a" tick={{ fontSize: 12 }} />
                <YAxis stroke="#71717a" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#27272a',
                    border: '1px solid #3f3f46',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="profit" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="loss" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      
      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bets */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-track-100">Recent Bets</h3>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="space-y-3">
            {recentBetsData.map((bet) => (
              <div
                key={bet.id}
                className="flex items-center justify-between p-3 bg-track-800/50 rounded-lg hover:bg-track-800 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      bet.result === 'won'
                        ? 'bg-profit/20'
                        : bet.result === 'lost'
                        ? 'bg-loss/20'
                        : 'bg-pending/20'
                    )}
                  >
                    {bet.result === 'won' ? (
                      <ArrowUpRight className="w-5 h-5 text-profit" />
                    ) : bet.result === 'lost' ? (
                      <ArrowDownRight className="w-5 h-5 text-loss" />
                    ) : (
                      <Activity className="w-5 h-5 text-pending" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-track-100">
                      {(bet.runner as { horseName: string })?.horseName}
                    </p>
                    <p className="text-sm text-track-400">
                      {(bet.race as { courseName: string })?.courseName} •{' '}
                      {(bet.race as { raceTime: string })?.raceTime}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={cn(
                      'font-mono font-semibold',
                      bet.profitLoss != null
                        ? bet.profitLoss >= 0
                          ? 'text-profit'
                          : 'text-loss'
                        : 'text-pending'
                    )}
                  >
                    {bet.profitLoss != null
                      ? formatCurrency(bet.profitLoss)
                      : 'Pending'}
                  </p>
                  <p className="text-sm text-track-500">@ {bet.odds}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        {/* Upcoming Qualifying Races */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-track-100">Qualifying Races</h3>
            <Badge variant="info">{upcomingRaces.length} races</Badge>
          </div>
          <div className="space-y-3">
            {upcomingRaces.map((race) => (
              <div
                key={race.id}
                className="flex items-center justify-between p-3 bg-track-800/50 rounded-lg hover:bg-track-800 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-lg bg-turf-500/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-turf-400" />
                  </div>
                  <div>
                    <p className="font-medium text-track-100">{race.course}</p>
                    <p className="text-sm text-track-400">
                      {race.favorite} • {race.runners} runners
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-semibold text-silk-400">{race.time}</p>
                  <p className="text-sm text-track-500">BSP {race.odds}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      
      {/* Strategy Summary */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-track-100">Active Strategy: Smart Favorite Lay</h3>
            <p className="text-sm text-track-400">Laying favorites at BSP 2.0 - 4.5 with modified Kelly staking</p>
          </div>
          <Button variant="secondary">Edit Strategy</Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="p-4 bg-track-800/50 rounded-lg">
            <p className="text-xs text-track-400 uppercase tracking-wider">Odds Range</p>
            <p className="text-lg font-mono font-semibold text-track-100">2.0 - 4.5</p>
          </div>
          <div className="p-4 bg-track-800/50 rounded-lg">
            <p className="text-xs text-track-400 uppercase tracking-wider">Runners</p>
            <p className="text-lg font-mono font-semibold text-track-100">6 - 20</p>
          </div>
          <div className="p-4 bg-track-800/50 rounded-lg">
            <p className="text-xs text-track-400 uppercase tracking-wider">Base Stake</p>
            <p className="text-lg font-mono font-semibold text-track-100">0.5%</p>
          </div>
          <div className="p-4 bg-track-800/50 rounded-lg">
            <p className="text-xs text-track-400 uppercase tracking-wider">Max Liability</p>
            <p className="text-lg font-mono font-semibold text-track-100">2.0%</p>
          </div>
          <div className="p-4 bg-track-800/50 rounded-lg">
            <p className="text-xs text-track-400 uppercase tracking-wider">Daily Limit</p>
            <p className="text-lg font-mono font-semibold text-track-100">5.0%</p>
          </div>
          <div className="p-4 bg-track-800/50 rounded-lg">
            <p className="text-xs text-track-400 uppercase tracking-wider">Weekly Limit</p>
            <p className="text-lg font-mono font-semibold text-track-100">10.0%</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
