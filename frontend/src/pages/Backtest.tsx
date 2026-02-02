import React, { useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  FlaskConical,
  Play,
  Calendar,
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  Download,
  Settings,
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, StatCard, Tabs } from '../components/ui';
import { cn, formatCurrency, formatPercent } from '../utils';
import type { StrategyRules } from '../types';

// Mock backtest results
const backtestEquityCurve = Array.from({ length: 365 }, (_, i) => {
  const date = new Date(2024, 0, 1);
  date.setDate(date.getDate() + i);
  const baseValue = 100000;
  const trend = i * 73; // ~26.8% annual return
  const noise = Math.random() * 2000 - 1000;
  return {
    date: date.toISOString().split('T')[0],
    value: Math.round(baseValue + trend + noise),
  };
});

const monthlyReturns = [
  { month: 'Jan', return: 2.5 },
  { month: 'Feb', return: 1.8 },
  { month: 'Mar', return: -1.2 },
  { month: 'Apr', return: 3.1 },
  { month: 'May', return: 2.2 },
  { month: 'Jun', return: -0.8 },
  { month: 'Jul', return: 4.2 },
  { month: 'Aug', return: 2.9 },
  { month: 'Sep', return: -1.5 },
  { month: 'Oct', return: 3.8 },
  { month: 'Nov', return: 3.2 },
  { month: 'Dec', return: 3.6 },
];

const oddsDistribution = [
  { range: '2.0-2.5', wins: 450, losses: 210 },
  { range: '2.5-3.0', wins: 380, losses: 190 },
  { range: '3.0-3.5', wins: 320, losses: 180 },
  { range: '3.5-4.0', wins: 280, losses: 170 },
  { range: '4.0-4.5', wins: 240, losses: 160 },
];

const raceTypeBreakdown = [
  { name: 'Flat', value: 35, color: '#22c55e' },
  { name: 'Chase', value: 30, color: '#eab308' },
  { name: 'Hurdle', value: 25, color: '#3b82f6' },
  { name: 'NH Flat', value: 10, color: '#8b5cf6' },
];

const defaultStrategyRules: StrategyRules = {
  minOdds: 2.0,
  maxOdds: 4.5,
  minRunners: 6,
  maxRunners: 20,
  allowedRaceTypes: ['flat', 'hurdle', 'chase', 'national_hunt_flat'],
  excludeHandicaps: false,
  handicapStakeMultiplier: 0.7,
  goingAdjustments: {
    firm: 0.8,
    good_to_firm: 0.9,
    good: 1.0,
    good_to_soft: 1.0,
    soft: 1.2,
    heavy: 1.2,
    standard: 1.0,
    slow: 1.0,
  },
  trackAdjustments: {
    figure8: 1.15,
  },
  monthlyAdjustments: {
    1: 0.9, 2: 0.9, 3: 0.9,
    12: 0.85,
  },
  excludeAmateurRaces: true,
  excludeApprenticeRaces: true,
};

export const Backtest: React.FC = () => {
  const [activeTab, setActiveTab] = useState('results');
  const [isRunning, setIsRunning] = useState(false);
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [initialBankroll, setInitialBankroll] = useState(100000);
  const [rules, setRules] = useState(defaultStrategyRules);
  
  const tabs = [
    { id: 'results', label: 'Results' },
    { id: 'analysis', label: 'Analysis' },
    { id: 'settings', label: 'Strategy Settings' },
  ];
  
  const handleRunBacktest = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setActiveTab('results');
    }, 2000);
  };
  
  // Calculate summary stats
  const finalValue = backtestEquityCurve[backtestEquityCurve.length - 1].value;
  const totalReturn = ((finalValue - initialBankroll) / initialBankroll) * 100;
  const totalBets = 2580;
  const wonBets = 1670;
  const winRate = (wonBets / totalBets) * 100;
  const avgOdds = 2.85;
  const maxDrawdown = 8.2;
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-track-100">
            Strategy Backtest
          </h1>
          <p className="text-track-400 mt-1">
            Test your lay strategy against historical data
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Export Results
          </Button>
          <Button
            variant="primary"
            onClick={handleRunBacktest}
            loading={isRunning}
          >
            <Play className="w-4 h-4 mr-2" />
            Run Backtest
          </Button>
        </div>
      </div>
      
      {/* Configuration */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            type="date"
            label="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            type="date"
            label="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Input
            type="number"
            label="Initial Bankroll"
            value={initialBankroll}
            onChange={(e) => setInitialBankroll(parseInt(e.target.value))}
          />
          <div className="flex items-end">
            <Button variant="secondary" className="w-full">
              <Settings className="w-4 h-4 mr-2" />
              Configure Strategy
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      
      {/* Results Tab */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Final Bankroll"
              value={formatCurrency(finalValue)}
              change={totalReturn}
              changeLabel="total return"
              icon={<TrendingUp className="w-5 h-5" />}
            />
            <StatCard
              title="Total Bets"
              value={totalBets.toLocaleString()}
              icon={<Activity className="w-5 h-5" />}
            />
            <StatCard
              title="Win Rate"
              value={`${winRate.toFixed(1)}%`}
              icon={<Target className="w-5 h-5" />}
            />
            <StatCard
              title="Max Drawdown"
              value={`-${maxDrawdown.toFixed(1)}%`}
              icon={<TrendingDown className="w-5 h-5" />}
            />
          </div>
          
          {/* Equity Curve */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-track-100">Equity Curve</h3>
                <p className="text-sm text-track-400">Portfolio value over time</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-track-400">Return:</span>
                  <span className={cn(
                    'font-mono font-semibold',
                    totalReturn >= 0 ? 'text-profit' : 'text-loss'
                  )}>
                    {formatPercent(totalReturn)}
                  </span>
                </div>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={backtestEquityCurve}>
                  <defs>
                    <linearGradient id="backtestGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                  <XAxis
                    dataKey="date"
                    stroke="#71717a"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-GB', { month: 'short' })}
                    interval={30}
                  />
                  <YAxis
                    stroke="#71717a"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`}
                    domain={['dataMin - 5000', 'dataMax + 5000']}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#27272a',
                      border: '1px solid #3f3f46',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Balance']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('en-GB')}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#22c55e"
                    strokeWidth={2}
                    fill="url(#backtestGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
          
          {/* Monthly Returns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-track-100">Monthly Returns</h3>
                <p className="text-sm text-track-400">Performance breakdown by month</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyReturns}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                    <XAxis dataKey="month" stroke="#71717a" tick={{ fontSize: 12 }} />
                    <YAxis
                      stroke="#71717a"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#27272a',
                        border: '1px solid #3f3f46',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`${value.toFixed(1)}%`, 'Return']}
                    />
                    <Bar
                      dataKey="return"
                      fill="#22c55e"
                      radius={[4, 4, 0, 0]}
                    >
                      {monthlyReturns.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.return >= 0 ? '#22c55e' : '#ef4444'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            
            <Card>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-track-100">Race Type Distribution</h3>
                <p className="text-sm text-track-400">Bets by race category</p>
              </div>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={raceTypeBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {raceTypeBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#27272a',
                        border: '1px solid #3f3f46',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center space-x-6 mt-4">
                {raceTypeBreakdown.map((item) => (
                  <div key={item.name} className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-track-400">{item.name}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
      
      {/* Analysis Tab */}
      {activeTab === 'analysis' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card className="p-4">
              <p className="text-xs text-track-400 uppercase tracking-wider">Total P&L</p>
              <p className="text-xl font-mono font-semibold text-profit">
                {formatCurrency(finalValue - initialBankroll)}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-track-400 uppercase tracking-wider">ROI</p>
              <p className="text-xl font-mono font-semibold text-profit">
                {formatPercent(totalReturn)}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-track-400 uppercase tracking-wider">Avg Odds</p>
              <p className="text-xl font-mono font-semibold text-track-100">{avgOdds}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-track-400 uppercase tracking-wider">Strike Rate</p>
              <p className="text-xl font-mono font-semibold text-track-100">
                {(100 - winRate).toFixed(1)}%
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-track-400 uppercase tracking-wider">Sharpe Ratio</p>
              <p className="text-xl font-mono font-semibold text-track-100">1.85</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-track-400 uppercase tracking-wider">Profit Factor</p>
              <p className="text-xl font-mono font-semibold text-track-100">1.42</p>
            </Card>
          </div>
          
          {/* Odds Distribution */}
          <Card>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-track-100">Performance by Odds Range</h3>
              <p className="text-sm text-track-400">Win/Loss breakdown across BSP ranges</p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={oddsDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                  <XAxis type="number" stroke="#71717a" tick={{ fontSize: 12 }} />
                  <YAxis
                    dataKey="range"
                    type="category"
                    stroke="#71717a"
                    tick={{ fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#27272a',
                      border: '1px solid #3f3f46',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="wins" fill="#22c55e" name="Wins" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="losses" fill="#ef4444" name="Losses" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          
          {/* Detailed Stats Table */}
          <Card>
            <h3 className="text-lg font-semibold text-track-100 mb-4">Detailed Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-track-800/50 rounded-lg">
                <p className="text-sm text-track-400">Winning Lays</p>
                <p className="text-lg font-mono font-semibold text-profit">{wonBets}</p>
              </div>
              <div className="p-4 bg-track-800/50 rounded-lg">
                <p className="text-sm text-track-400">Losing Lays</p>
                <p className="text-lg font-mono font-semibold text-loss">{totalBets - wonBets}</p>
              </div>
              <div className="p-4 bg-track-800/50 rounded-lg">
                <p className="text-sm text-track-400">Longest Win Streak</p>
                <p className="text-lg font-mono font-semibold text-track-100">12</p>
              </div>
              <div className="p-4 bg-track-800/50 rounded-lg">
                <p className="text-sm text-track-400">Longest Loss Streak</p>
                <p className="text-lg font-mono font-semibold text-track-100">6</p>
              </div>
              <div className="p-4 bg-track-800/50 rounded-lg">
                <p className="text-sm text-track-400">Avg Win</p>
                <p className="text-lg font-mono font-semibold text-profit">£385</p>
              </div>
              <div className="p-4 bg-track-800/50 rounded-lg">
                <p className="text-sm text-track-400">Avg Loss</p>
                <p className="text-lg font-mono font-semibold text-loss">-£725</p>
              </div>
            </div>
          </Card>
        </div>
      )}
      
      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-track-100 mb-4">Odds & Runners</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Input
                type="number"
                label="Min Odds"
                value={rules.minOdds}
                onChange={(e) => setRules({ ...rules, minOdds: parseFloat(e.target.value) })}
                step={0.1}
              />
              <Input
                type="number"
                label="Max Odds"
                value={rules.maxOdds}
                onChange={(e) => setRules({ ...rules, maxOdds: parseFloat(e.target.value) })}
                step={0.1}
              />
              <Input
                type="number"
                label="Min Runners"
                value={rules.minRunners}
                onChange={(e) => setRules({ ...rules, minRunners: parseInt(e.target.value) })}
              />
              <Input
                type="number"
                label="Max Runners"
                value={rules.maxRunners}
                onChange={(e) => setRules({ ...rules, maxRunners: parseInt(e.target.value) })}
              />
            </div>
          </Card>
          
          <Card>
            <h3 className="text-lg font-semibold text-track-100 mb-4">Going Adjustments</h3>
            <p className="text-sm text-track-400 mb-4">
              Stake multipliers based on ground conditions (1.0 = no change)
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(rules.goingAdjustments).map(([going, value]) => (
                <Input
                  key={going}
                  type="number"
                  label={going.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  value={value}
                  onChange={(e) =>
                    setRules({
                      ...rules,
                      goingAdjustments: {
                        ...rules.goingAdjustments,
                        [going]: parseFloat(e.target.value),
                      },
                    })
                  }
                  step={0.1}
                />
              ))}
            </div>
          </Card>
          
          <Card>
            <h3 className="text-lg font-semibold text-track-100 mb-4">Race Type Selection</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(['flat', 'hurdle', 'chase', 'national_hunt_flat', 'hunters_chase'] as const).map(
                (type) => (
                  <label key={type} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rules.allowedRaceTypes.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setRules({
                            ...rules,
                            allowedRaceTypes: [...rules.allowedRaceTypes, type],
                          });
                        } else {
                          setRules({
                            ...rules,
                            allowedRaceTypes: rules.allowedRaceTypes.filter((t) => t !== type),
                          });
                        }
                      }}
                      className="w-4 h-4 rounded border-track-600 bg-track-800 text-turf-500 focus:ring-turf-500"
                    />
                    <span className="text-track-200">
                      {type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  </label>
                )
              )}
            </div>
          </Card>
          
          <div className="flex justify-end space-x-3">
            <Button variant="secondary">Reset to Defaults</Button>
            <Button variant="primary">Save Strategy</Button>
          </div>
        </div>
      )}
    </div>
  );
};
