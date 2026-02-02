// Core domain types for the lay betting strategy

export interface Race {
  id: string;
  eventId: string;
  marketId: string;
  eventName: string;
  courseName: string;
  raceTime: string;
  raceDate: string;
  raceType: RaceType;
  raceClass: number;
  distance: string;
  going: GoingCondition;
  numberOfRunners: number;
  country: 'UK' | 'IRE';
  trackDirection: 'left' | 'right' | 'straight' | 'figure8';
  isHandicap: boolean;
}

export type RaceType = 
  | 'flat'
  | 'hurdle'
  | 'chase'
  | 'national_hunt_flat'
  | 'hunters_chase';

export type GoingCondition = 
  | 'firm'
  | 'good_to_firm'
  | 'good'
  | 'good_to_soft'
  | 'soft'
  | 'heavy'
  | 'standard'
  | 'slow';

export interface Runner {
  id: string;
  raceId: string;
  selectionId: number;
  horseName: string;
  jockey: string;
  trainer: string;
  age: number;
  weight: string;
  draw: number | null;
  bspOdds: number | null;
  position: number | null;
  isFavorite: boolean;
  sp: string;
}

export interface StrategyConfig {
  id: string;
  name: string;
  description: string;
  rules: StrategyRules;
  stakeManagement: StakeManagement;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StrategyRules {
  minOdds: number;
  maxOdds: number;
  minRunners: number;
  maxRunners: number;
  allowedRaceTypes: RaceType[];
  excludeHandicaps: boolean;
  handicapStakeMultiplier: number;
  goingAdjustments: Record<GoingCondition, number>;
  trackAdjustments: Record<string, number>;
  monthlyAdjustments: Record<number, number>;
  excludeAmateurRaces: boolean;
  excludeApprenticeRaces: boolean;
}

export interface StakeManagement {
  baseStakePercent: number;
  maxLiabilityPercent: number;
  dailyLossLimitPercent: number;
  weeklyLossLimitPercent: number;
  useKellyCriterion: boolean;
  kellyFraction: number;
}

export interface Bet {
  id: string;
  raceId: string;
  race: Race;
  runner: Runner;
  strategyId: string;
  betType: 'lay';
  odds: number;
  stake: number;
  liability: number;
  status: BetStatus;
  result: BetResult | null;
  profitLoss: number | null;
  placedAt: string;
  settledAt: string | null;
}

export type BetStatus = 'pending' | 'matched' | 'settled' | 'cancelled' | 'voided';
export type BetResult = 'won' | 'lost' | 'void';

export interface DailyPerformance {
  date: string;
  totalBets: number;
  wonBets: number;
  lostBets: number;
  turnover: number;
  liability: number;
  profitLoss: number;
  roi: number;
  startingBank: number;
  endingBank: number;
}

export interface StrategyPerformance {
  strategyId: string;
  totalBets: number;
  wonBets: number;
  lostBets: number;
  winRate: number;
  totalTurnover: number;
  totalLiability: number;
  totalProfitLoss: number;
  roi: number;
  maxDrawdown: number;
  sharpeRatio: number;
  dailyPerformance: DailyPerformance[];
}

export interface BacktestRequest {
  strategyConfig: StrategyConfig;
  startDate: string;
  endDate: string;
  initialBankroll: number;
}

export interface BacktestResult {
  id: string;
  strategyConfig: StrategyConfig;
  startDate: string;
  endDate: string;
  initialBankroll: number;
  finalBankroll: number;
  performance: StrategyPerformance;
  qualifyingRaces: number;
  totalRacesAnalyzed: number;
  bets: Bet[];
  createdAt: string;
}

export interface QualifyingRace extends Race {
  favorite: Runner;
  qualificationScore: number;
  adjustedStakeMultiplier: number;
  suggestedStake: number;
  suggestedLiability: number;
  reasons: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DashboardStats {
  currentBankroll: number;
  todayPL: number;
  weekPL: number;
  monthPL: number;
  totalPL: number;
  activeBets: number;
  pendingRaces: number;
  winRate: number;
  roi: number;
  streak: {
    type: 'winning' | 'losing';
    count: number;
  };
}

export interface FilterParams {
  startDate?: string;
  endDate?: string;
  country?: 'UK' | 'IRE' | 'all';
  raceType?: RaceType | 'all';
  course?: string;
  minOdds?: number;
  maxOdds?: number;
  page?: number;
  pageSize?: number;
}
