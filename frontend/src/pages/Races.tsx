import React, { useState } from 'react';
import {
  Calendar,
  Filter,
  Search,
  MapPin,
  Users,
  Clock,
  ChevronRight,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, Tabs } from '../components/ui';
import { formatOdds, formatGoing, formatRaceType } from '../utils';
import { useAppStore } from '../store';
import type { QualifyingRace, RaceType } from '../types';

// Mock qualifying races data
const mockQualifyingRaces: QualifyingRace[] = [
  {
    id: '1',
    eventId: 'e1',
    marketId: 'm1',
    eventName: 'Cheltenham 14:30',
    courseName: 'Cheltenham',
    raceTime: '14:30',
    raceDate: '2024-12-16',
    raceType: 'chase',
    raceClass: 1,
    distance: '3m 2f',
    going: 'soft',
    numberOfRunners: 10,
    country: 'UK',
    trackDirection: 'left',
    isHandicap: false,
    favorite: {
      id: 'r1',
      raceId: '1',
      selectionId: 12345,
      horseName: 'Energumene',
      jockey: 'P. Townend',
      trainer: 'W.P. Mullins',
      age: 9,
      weight: '11-10',
      draw: null,
      bspOdds: 2.4,
      position: null,
      isFavorite: true,
      sp: '11/8',
    },
    qualificationScore: 92,
    adjustedStakeMultiplier: 1.2,
    suggestedStake: 760,
    suggestedLiability: 1064,
    reasons: ['All criteria met', 'Soft going (+20% stake)', 'Left-handed track'],
  },
  {
    id: '2',
    eventId: 'e2',
    marketId: 'm2',
    eventName: 'Leopardstown 15:15',
    courseName: 'Leopardstown',
    raceTime: '15:15',
    raceDate: '2024-12-16',
    raceType: 'hurdle',
    raceClass: 1,
    distance: '2m 4f',
    going: 'good_to_soft',
    numberOfRunners: 12,
    country: 'IRE',
    trackDirection: 'left',
    isHandicap: false,
    favorite: {
      id: 'r2',
      raceId: '2',
      selectionId: 12346,
      horseName: 'Constitution Hill',
      jockey: 'N. de Boinville',
      trainer: 'N. Henderson',
      age: 6,
      weight: '11-10',
      draw: null,
      bspOdds: 2.1,
      position: null,
      isFavorite: true,
      sp: '6/5',
    },
    qualificationScore: 88,
    adjustedStakeMultiplier: 1.0,
    suggestedStake: 634,
    suggestedLiability: 697,
    reasons: ['All criteria met', 'Standard conditions'],
  },
  {
    id: '3',
    eventId: 'e3',
    marketId: 'm3',
    eventName: 'Sandown 15:50',
    courseName: 'Sandown',
    raceTime: '15:50',
    raceDate: '2024-12-16',
    raceType: 'chase',
    raceClass: 2,
    distance: '2m',
    going: 'good',
    numberOfRunners: 8,
    country: 'UK',
    trackDirection: 'right',
    isHandicap: false,
    favorite: {
      id: 'r3',
      raceId: '3',
      selectionId: 12347,
      horseName: 'Shishkin',
      jockey: 'N. de Boinville',
      trainer: 'N. Henderson',
      age: 8,
      weight: '11-10',
      draw: null,
      bspOdds: 2.8,
      position: null,
      isFavorite: true,
      sp: '7/4',
    },
    qualificationScore: 85,
    adjustedStakeMultiplier: 1.0,
    suggestedStake: 634,
    suggestedLiability: 1141,
    reasons: ['All criteria met', 'Good conditions'],
  },
  {
    id: '4',
    eventId: 'e4',
    marketId: 'm4',
    eventName: 'Kempton 14:00',
    courseName: 'Kempton',
    raceTime: '14:00',
    raceDate: '2024-12-16',
    raceType: 'chase',
    raceClass: 1,
    distance: '3m',
    going: 'good_to_soft',
    numberOfRunners: 9,
    country: 'UK',
    trackDirection: 'right',
    isHandicap: false,
    favorite: {
      id: 'r4',
      raceId: '4',
      selectionId: 12348,
      horseName: 'Allaho',
      jockey: 'P. Townend',
      trainer: 'W.P. Mullins',
      age: 10,
      weight: '11-10',
      draw: null,
      bspOdds: 3.4,
      position: null,
      isFavorite: true,
      sp: '12/5',
    },
    qualificationScore: 78,
    adjustedStakeMultiplier: 1.0,
    suggestedStake: 634,
    suggestedLiability: 1522,
    reasons: ['All criteria met', 'Standard conditions'],
  },
];

const nonQualifyingRaces = [
  {
    id: 'nq1',
    courseName: 'Wolverhampton',
    raceTime: '12:30',
    raceType: 'flat' as RaceType,
    runners: 14,
    favoriteOdds: 1.8,
    reason: 'Odds below minimum (1.80 < 2.00)',
  },
  {
    id: 'nq2',
    courseName: 'Lingfield',
    raceTime: '13:15',
    raceType: 'flat' as RaceType,
    runners: 5,
    favoriteOdds: 2.5,
    reason: 'Too few runners (5 < 6)',
  },
  {
    id: 'nq3',
    courseName: 'Catterick',
    raceTime: '14:45',
    raceType: 'hurdle' as RaceType,
    runners: 8,
    favoriteOdds: 5.2,
    reason: 'Odds above maximum (5.20 > 4.50)',
  },
];

const raceTypeOptions = [
  { value: 'all', label: 'All Race Types' },
  { value: 'flat', label: 'Flat' },
  { value: 'hurdle', label: 'Hurdle' },
  { value: 'chase', label: 'Chase' },
  { value: 'national_hunt_flat', label: 'NH Flat' },
];

const countryOptions = [
  { value: 'all', label: 'UK & Ireland' },
  { value: 'UK', label: 'UK Only' },
  { value: 'IRE', label: 'Ireland Only' },
];

export const Races: React.FC = () => {
  const [activeTab, setActiveTab] = useState('qualifying');
  const [searchQuery, setSearchQuery] = useState('');
  const { filters, setFilters } = useAppStore();
  
  const tabs = [
    { id: 'qualifying', label: 'Qualifying', count: mockQualifyingRaces.length },
    { id: 'all', label: 'All Races', count: 48 },
    { id: 'excluded', label: 'Excluded', count: nonQualifyingRaces.length },
  ];
  
  const filteredRaces = mockQualifyingRaces.filter((race) =>
    race.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    race.favorite.horseName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-track-100">
            Race Analysis
          </h1>
          <p className="text-track-400 mt-1">
            Find qualifying races for your lay strategy
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Input
            placeholder="Search races..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
            className="w-64"
          />
          <Button variant="secondary">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>
      
      {/* Filters Bar */}
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4">
            <Input
              type="date"
              label="Date"
              value={filters.startDate || ''}
              onChange={(e) => setFilters({ startDate: e.target.value })}
            />
            <Select
              label="Country"
              options={countryOptions}
              value={filters.country || 'all'}
              onChange={(e) => setFilters({ country: e.target.value as 'UK' | 'IRE' | 'all' })}
            />
            <Select
              label="Race Type"
              options={raceTypeOptions}
              value={filters.raceType || 'all'}
              onChange={(e) => setFilters({ raceType: e.target.value as RaceType | 'all' })}
            />
            <Input
              type="number"
              label="Min Odds"
              value={filters.minOdds || 2.0}
              onChange={(e) => setFilters({ minOdds: parseFloat(e.target.value) })}
              step={0.1}
            />
            <Input
              type="number"
              label="Max Odds"
              value={filters.maxOdds || 4.5}
              onChange={(e) => setFilters({ maxOdds: parseFloat(e.target.value) })}
              step={0.1}
            />
          </div>
        </div>
      </Card>
      
      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      
      {/* Qualifying Races */}
      {activeTab === 'qualifying' && (
        <div className="space-y-4">
          {filteredRaces.map((race) => (
            <Card
              key={race.id}
              className="hover:border-turf-500/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Race Header */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-track-400" />
                      <span className="font-semibold text-track-100">{race.courseName}</span>
                      <Badge variant={race.country === 'UK' ? 'default' : 'info'}>
                        {race.country}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-track-400">
                      <Clock className="w-4 h-4" />
                      <span>{race.raceTime}</span>
                    </div>
                    <Badge>{formatRaceType(race.raceType)}</Badge>
                    <Badge variant="default">{formatGoing(race.going)}</Badge>
                  </div>
                  
                  {/* Race Details */}
                  <div className="flex items-center space-x-8 text-sm text-track-400 mb-4">
                    <span className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{race.numberOfRunners} runners</span>
                    </span>
                    <span>Distance: {race.distance}</span>
                    <span>Class {race.raceClass}</span>
                    <span>Track: {race.trackDirection}-handed</span>
                  </div>
                  
                  {/* Favorite Info */}
                  <div className="flex items-center justify-between p-4 bg-track-800/50 rounded-lg">
                    <div>
                      <p className="text-xs text-track-400 uppercase tracking-wider mb-1">Favorite</p>
                      <p className="text-lg font-semibold text-track-100">{race.favorite.horseName}</p>
                      <p className="text-sm text-track-400">
                        {race.favorite.jockey} • {race.favorite.trainer}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-track-400 uppercase tracking-wider mb-1">BSP</p>
                      <p className="text-2xl font-mono font-semibold text-silk-400">
                        {formatOdds(race.favorite.bspOdds!)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-track-400 uppercase tracking-wider mb-1">Suggested Stake</p>
                      <p className="text-xl font-mono font-semibold text-track-100">
                        £{race.suggestedStake.toLocaleString()}
                      </p>
                      <p className="text-sm text-track-400">
                        Liability: £{race.suggestedLiability.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {/* Qualification Reasons */}
                  <div className="mt-4 flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-profit" />
                    <div className="flex flex-wrap gap-2">
                      {race.reasons.map((reason, i) => (
                        <span key={i} className="text-sm text-track-400">
                          {reason}
                          {i < race.reasons.length - 1 && ' •'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex flex-col items-end space-y-3 ml-6">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-track-400">Score:</span>
                    <Badge variant="success">{race.qualificationScore}%</Badge>
                  </div>
                  <Button variant="primary">
                    Place Lay
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* Excluded Races */}
      {activeTab === 'excluded' && (
        <div className="space-y-3">
          {nonQualifyingRaces.map((race) => (
            <Card key={race.id} className="p-4 opacity-60">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <XCircle className="w-5 h-5 text-loss" />
                  <div>
                    <p className="font-medium text-track-200">
                      {race.courseName} {race.raceTime}
                    </p>
                    <p className="text-sm text-track-400">
                      {formatRaceType(race.raceType)} • {race.runners} runners • BSP {race.favoriteOdds}
                    </p>
                  </div>
                </div>
                <Badge variant="danger">{race.reason}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* All Races Placeholder */}
      {activeTab === 'all' && (
        <Card className="text-center py-12">
          <Calendar className="w-12 h-12 mx-auto text-track-500 mb-4" />
          <h3 className="text-lg font-semibold text-track-200 mb-2">All Races View</h3>
          <p className="text-track-400 mb-4">
            Browse all UK & Ireland races for the selected date
          </p>
          <Button variant="secondary">Load Race Data</Button>
        </Card>
      )}
    </div>
  );
};
