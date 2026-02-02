import { clsx, type ClassValue } from 'clsx';
import { format, parseISO, differenceInDays } from 'date-fns';
import type { GoingCondition, RaceType, StrategyRules } from '../types';

// Class name utility
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Format currency
export function formatCurrency(amount: number, currency = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format percentage
export function formatPercent(value: number, decimals = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

// Format odds
export function formatOdds(odds: number): string {
  return odds.toFixed(2);
}

// Format date
export function formatDate(date: string | Date, formatStr = 'dd MMM yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr);
}

// Format time
export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'HH:mm');
}

// Calculate liability for a lay bet
export function calculateLiability(stake: number, odds: number): number {
  return stake * (odds - 1);
}

// Calculate profit for a winning lay bet
export function calculateLayProfit(stake: number): number {
  return stake;
}

// Calculate recommended stake based on strategy rules
export function calculateStake(
  bankroll: number,
  baseStakePercent: number,
  odds: number,
  maxLiabilityPercent: number,
  adjustmentMultiplier = 1
): { stake: number; liability: number } {
  const baseStake = bankroll * (baseStakePercent / 100) * adjustmentMultiplier;
  const liability = calculateLiability(baseStake, odds);
  const maxLiability = bankroll * (maxLiabilityPercent / 100);
  
  if (liability > maxLiability) {
    const adjustedStake = maxLiability / (odds - 1);
    return {
      stake: Math.floor(adjustedStake * 100) / 100,
      liability: Math.floor(maxLiability * 100) / 100,
    };
  }
  
  return {
    stake: Math.floor(baseStake * 100) / 100,
    liability: Math.floor(liability * 100) / 100,
  };
}

// Calculate adjustment multiplier based on strategy rules
export function calculateAdjustmentMultiplier(
  rules: StrategyRules,
  going: GoingCondition,
  trackType: string,
  month: number,
  isHandicap: boolean
): number {
  let multiplier = 1;
  
  // Going adjustment
  multiplier *= rules.goingAdjustments[going] ?? 1;
  
  // Track adjustment
  multiplier *= rules.trackAdjustments[trackType] ?? 1;
  
  // Monthly adjustment
  multiplier *= rules.monthlyAdjustments[month] ?? 1;
  
  // Handicap adjustment
  if (isHandicap && !rules.excludeHandicaps) {
    multiplier *= rules.handicapStakeMultiplier;
  }
  
  return multiplier;
}

// Check if race qualifies for the strategy
export function raceQualifies(
  rules: StrategyRules,
  raceType: RaceType,
  numRunners: number,
  isHandicap: boolean,
  favoriteOdds: number | null
): { qualifies: boolean; reasons: string[] } {
  const reasons: string[] = [];
  
  // Check odds range
  if (favoriteOdds === null) {
    reasons.push('No BSP odds available');
    return { qualifies: false, reasons };
  }
  
  if (favoriteOdds < rules.minOdds) {
    reasons.push(`Odds ${favoriteOdds.toFixed(2)} below minimum ${rules.minOdds}`);
  }
  
  if (favoriteOdds > rules.maxOdds) {
    reasons.push(`Odds ${favoriteOdds.toFixed(2)} above maximum ${rules.maxOdds}`);
  }
  
  // Check runner count
  if (numRunners < rules.minRunners) {
    reasons.push(`Only ${numRunners} runners (minimum: ${rules.minRunners})`);
  }
  
  if (numRunners > rules.maxRunners) {
    reasons.push(`${numRunners} runners exceeds maximum of ${rules.maxRunners}`);
  }
  
  // Check race type
  if (!rules.allowedRaceTypes.includes(raceType)) {
    reasons.push(`Race type ${raceType} not allowed`);
  }
  
  // Check handicap
  if (isHandicap && rules.excludeHandicaps) {
    reasons.push('Handicap races excluded');
  }
  
  return {
    qualifies: reasons.length === 0,
    reasons: reasons.length > 0 ? reasons : ['All criteria met'],
  };
}

// Calculate ROI
export function calculateROI(profitLoss: number, turnover: number): number {
  if (turnover === 0) return 0;
  return (profitLoss / turnover) * 100;
}

// Calculate win rate
export function calculateWinRate(wins: number, total: number): number {
  if (total === 0) return 0;
  return (wins / total) * 100;
}

// Calculate maximum drawdown from equity curve
export function calculateMaxDrawdown(equityCurve: number[]): number {
  if (equityCurve.length === 0) return 0;
  
  let maxDrawdown = 0;
  let peak = equityCurve[0];
  
  for (const value of equityCurve) {
    if (value > peak) {
      peak = value;
    }
    const drawdown = ((peak - value) / peak) * 100;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }
  
  return maxDrawdown;
}

// Get color class based on profit/loss
export function getPLColorClass(value: number): string {
  if (value > 0) return 'text-profit';
  if (value < 0) return 'text-loss';
  return 'text-track-400';
}

// Get background color class based on profit/loss
export function getPLBgClass(value: number): string {
  if (value > 0) return 'bg-profit/10';
  if (value < 0) return 'bg-loss/10';
  return 'bg-track-700';
}

// Format race type for display
export function formatRaceType(raceType: RaceType): string {
  const labels: Record<RaceType, string> = {
    flat: 'Flat',
    hurdle: 'Hurdle',
    chase: 'Chase',
    national_hunt_flat: 'NH Flat',
    hunters_chase: "Hunter's Chase",
  };
  return labels[raceType] || raceType;
}

// Format going condition for display
export function formatGoing(going: GoingCondition): string {
  const labels: Record<GoingCondition, string> = {
    firm: 'Firm',
    good_to_firm: 'Good to Firm',
    good: 'Good',
    good_to_soft: 'Good to Soft',
    soft: 'Soft',
    heavy: 'Heavy',
    standard: 'Standard',
    slow: 'Slow',
  };
  return labels[going] || going;
}

// Debounce function
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Calculate days between dates
export function daysBetween(start: string | Date, end: string | Date): number {
  const startDate = typeof start === 'string' ? parseISO(start) : start;
  const endDate = typeof end === 'string' ? parseISO(end) : end;
  return differenceInDays(endDate, startDate);
}
