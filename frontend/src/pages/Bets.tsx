// Bets Page
import React, { useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Filter,
  Download,
  Clock,
} from 'lucide-react';
import { Card, Button, Badge, Tabs, Input, Select } from '../components/ui';
import { cn, formatCurrency, formatDate, formatTime } from '../utils';
import type { Bet } from '../types';

const mockBets: Partial<Bet>[] = [
  {
    id: '1',
    race: { courseName: 'Cheltenham', raceTime: '14:30', raceDate: '2024-12-16' } as never,
    runner: { horseName: 'Energumene' } as never,
    odds: 2.4,
    stake: 760,
    liability: 1064,
    status: 'settled',
    result: 'won',
    profitLoss: 760,
    placedAt: '2024-12-16T14:25:00Z',
    settledAt: '2024-12-16T14:35:00Z',
  },
  {
    id: '2',
    race: { courseName: 'Leopardstown', raceTime: '15:15', raceDate: '2024-12-16' } as never,
    runner: { horseName: 'Constitution Hill' } as never,
    odds: 2.1,
    stake: 634,
    liability: 697,
    status: 'settled',
    result: 'lost',
    profitLoss: -697,
    placedAt: '2024-12-16T15:10:00Z',
    settledAt: '2024-12-16T15:20:00Z',
  },
  {
    id: '3',
    race: { courseName: 'Sandown', raceTime: '15:50', raceDate: '2024-12-16' } as never,
    runner: { horseName: 'Shishkin' } as never,
    odds: 2.8,
    stake: 634,
    liability: 1141,
    status: 'pending',
    result: null,
    profitLoss: null,
    placedAt: '2024-12-16T15:45:00Z',
  },
  {
    id: '4',
    race: { courseName: 'Kempton', raceTime: '14:00', raceDate: '2024-12-15' } as never,
    runner: { horseName: 'Allaho' } as never,
    odds: 3.4,
    stake: 634,
    liability: 1522,
    status: 'settled',
    result: 'won',
    profitLoss: 634,
    placedAt: '2024-12-15T13:55:00Z',
    settledAt: '2024-12-15T14:08:00Z',
  },
];

export const Bets: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  
  const tabs = [
    { id: 'all', label: 'All Bets', count: mockBets.length },
    { id: 'pending', label: 'Pending', count: mockBets.filter((b) => b.status === 'pending').length },
    { id: 'settled', label: 'Settled', count: mockBets.filter((b) => b.status === 'settled').length },
  ];
  
  const filteredBets = activeTab === 'all'
    ? mockBets
    : mockBets.filter((b) => b.status === activeTab);
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-track-100">Bet History</h1>
          <p className="text-track-400 mt-1">Track and manage your lay bets</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="secondary">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      
      <div className="space-y-3">
        {filteredBets.map((bet) => (
          <Card key={bet.id} className="hover:border-track-700 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center',
                    bet.result === 'won'
                      ? 'bg-profit/20'
                      : bet.result === 'lost'
                      ? 'bg-loss/20'
                      : 'bg-pending/20'
                  )}
                >
                  {bet.result === 'won' ? (
                    <ArrowUpRight className="w-6 h-6 text-profit" />
                  ) : bet.result === 'lost' ? (
                    <ArrowDownRight className="w-6 h-6 text-loss" />
                  ) : (
                    <Clock className="w-6 h-6 text-pending" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-track-100">
                    Lay {(bet.runner as { horseName: string })?.horseName}
                  </p>
                  <p className="text-sm text-track-400">
                    {(bet.race as { courseName: string })?.courseName} •{' '}
                    {formatDate((bet.race as { raceDate: string })?.raceDate)} •{' '}
                    {(bet.race as { raceTime: string })?.raceTime}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <p className="text-xs text-track-400 uppercase">Odds</p>
                  <p className="font-mono font-semibold text-track-100">{bet.odds}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-track-400 uppercase">Stake</p>
                  <p className="font-mono font-semibold text-track-100">£{bet.stake}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-track-400 uppercase">Liability</p>
                  <p className="font-mono font-semibold text-track-100">£{bet.liability}</p>
                </div>
                <div className="text-center min-w-[100px]">
                  <p className="text-xs text-track-400 uppercase">P&L</p>
                  <p
                    className={cn(
                      'font-mono font-semibold',
                      bet.profitLoss !== null
                        ? bet.profitLoss >= 0
                          ? 'text-profit'
                          : 'text-loss'
                        : 'text-pending'
                    )}
                  >
                    {bet.profitLoss !== null ? formatCurrency(bet.profitLoss) : 'Pending'}
                  </p>
                </div>
                <Badge
                  variant={
                    bet.status === 'pending'
                      ? 'warning'
                      : bet.result === 'won'
                      ? 'success'
                      : 'danger'
                  }
                >
                  {bet.status === 'pending' ? 'Pending' : bet.result === 'won' ? 'Won' : 'Lost'}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
