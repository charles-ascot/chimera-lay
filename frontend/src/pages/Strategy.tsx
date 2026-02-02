import React, { useState } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { Card, Button, Input, Badge } from '../components/ui';
import type { StrategyRules, StakeManagement } from '../types';

const defaultRules: StrategyRules = {
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
  trackAdjustments: { figure8: 1.15 },
  monthlyAdjustments: { 1: 0.9, 2: 0.9, 3: 0.9, 12: 0.85 },
  excludeAmateurRaces: true,
  excludeApprenticeRaces: true,
};

const defaultStaking: StakeManagement = {
  baseStakePercent: 0.5,
  maxLiabilityPercent: 2.0,
  dailyLossLimitPercent: 5.0,
  weeklyLossLimitPercent: 10.0,
  useKellyCriterion: true,
  kellyFraction: 0.25,
};

export const Strategy: React.FC = () => {
  const [rules, setRules] = useState(defaultRules);
  const [staking, setStaking] = useState(defaultStaking);
  const [hasChanges, setHasChanges] = useState(false);
  
  const handleRuleChange = (key: keyof StrategyRules, value: unknown) => {
    setRules({ ...rules, [key]: value });
    setHasChanges(true);
  };
  
  const handleStakingChange = (key: keyof StakeManagement, value: unknown) => {
    setStaking({ ...staking, [key]: value });
    setHasChanges(true);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-track-100">
            Strategy Configuration
          </h1>
          <p className="text-track-400 mt-1">Configure your lay betting strategy rules</p>
        </div>
        <div className="flex items-center space-x-3">
          {hasChanges && <Badge variant="warning">Unsaved changes</Badge>}
          <Button variant="secondary">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button variant="primary" disabled={!hasChanges}>
            <Save className="w-4 h-4 mr-2" />
            Save Strategy
          </Button>
        </div>
      </div>
      
      <Card>
        <h3 className="text-lg font-semibold text-track-100 mb-4">Odds & Field Size</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Input
            type="number"
            label="Minimum BSP Odds"
            value={rules.minOdds}
            onChange={(e) => handleRuleChange('minOdds', parseFloat(e.target.value))}
            step={0.1}
          />
          <Input
            type="number"
            label="Maximum BSP Odds"
            value={rules.maxOdds}
            onChange={(e) => handleRuleChange('maxOdds', parseFloat(e.target.value))}
            step={0.1}
          />
          <Input
            type="number"
            label="Minimum Runners"
            value={rules.minRunners}
            onChange={(e) => handleRuleChange('minRunners', parseInt(e.target.value))}
          />
          <Input
            type="number"
            label="Maximum Runners"
            value={rules.maxRunners}
            onChange={(e) => handleRuleChange('maxRunners', parseInt(e.target.value))}
          />
        </div>
      </Card>
      
      <Card>
        <h3 className="text-lg font-semibold text-track-100 mb-4">Stake Management</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Input
            type="number"
            label="Base Stake % of Bankroll"
            value={staking.baseStakePercent}
            onChange={(e) => handleStakingChange('baseStakePercent', parseFloat(e.target.value))}
            step={0.1}
          />
          <Input
            type="number"
            label="Max Liability %"
            value={staking.maxLiabilityPercent}
            onChange={(e) => handleStakingChange('maxLiabilityPercent', parseFloat(e.target.value))}
            step={0.1}
          />
          <Input
            type="number"
            label="Daily Loss Limit %"
            value={staking.dailyLossLimitPercent}
            onChange={(e) => handleStakingChange('dailyLossLimitPercent', parseFloat(e.target.value))}
            step={0.5}
          />
          <Input
            type="number"
            label="Weekly Loss Limit %"
            value={staking.weeklyLossLimitPercent}
            onChange={(e) => handleStakingChange('weeklyLossLimitPercent', parseFloat(e.target.value))}
            step={0.5}
          />
        </div>
      </Card>
      
      <Card>
        <h3 className="text-lg font-semibold text-track-100 mb-4">Race Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {(['flat', 'hurdle', 'chase', 'national_hunt_flat', 'hunters_chase'] as const).map(
            (type) => (
              <label key={type} className="flex items-center space-x-3 cursor-pointer p-3 bg-track-800/50 rounded-lg hover:bg-track-800 transition-colors">
                <input
                  type="checkbox"
                  checked={rules.allowedRaceTypes.includes(type)}
                  onChange={(e) => {
                    const newTypes = e.target.checked
                      ? [...rules.allowedRaceTypes, type]
                      : rules.allowedRaceTypes.filter((t) => t !== type);
                    handleRuleChange('allowedRaceTypes', newTypes);
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
      
      <Card>
        <h3 className="text-lg font-semibold text-track-100 mb-4">Going Adjustments</h3>
        <p className="text-sm text-track-400 mb-4">
          Multipliers applied to base stake based on ground conditions
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(rules.goingAdjustments).map(([going, value]) => (
            <Input
              key={going}
              type="number"
              label={going.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              value={value}
              onChange={(e) =>
                handleRuleChange('goingAdjustments', {
                  ...rules.goingAdjustments,
                  [going]: parseFloat(e.target.value),
                })
              }
              step={0.1}
            />
          ))}
        </div>
      </Card>
      
      <Card>
        <h3 className="text-lg font-semibold text-track-100 mb-4">Exclusions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex items-center space-x-3 cursor-pointer p-4 bg-track-800/50 rounded-lg">
            <input
              type="checkbox"
              checked={rules.excludeHandicaps}
              onChange={(e) => handleRuleChange('excludeHandicaps', e.target.checked)}
              className="w-4 h-4 rounded border-track-600 bg-track-800 text-turf-500 focus:ring-turf-500"
            />
            <div>
              <span className="text-track-200">Exclude Handicaps</span>
              <p className="text-xs text-track-400">Skip all handicap races</p>
            </div>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer p-4 bg-track-800/50 rounded-lg">
            <input
              type="checkbox"
              checked={rules.excludeAmateurRaces}
              onChange={(e) => handleRuleChange('excludeAmateurRaces', e.target.checked)}
              className="w-4 h-4 rounded border-track-600 bg-track-800 text-turf-500 focus:ring-turf-500"
            />
            <div>
              <span className="text-track-200">Exclude Amateur Races</span>
              <p className="text-xs text-track-400">Skip amateur jockey races</p>
            </div>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer p-4 bg-track-800/50 rounded-lg">
            <input
              type="checkbox"
              checked={rules.excludeApprenticeRaces}
              onChange={(e) => handleRuleChange('excludeApprenticeRaces', e.target.checked)}
              className="w-4 h-4 rounded border-track-600 bg-track-800 text-turf-500 focus:ring-turf-500"
            />
            <div>
              <span className="text-track-200">Exclude Apprentice Races</span>
              <p className="text-xs text-track-400">Skip apprentice jockey races</p>
            </div>
          </label>
        </div>
      </Card>
    </div>
  );
};
