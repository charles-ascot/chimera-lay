import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAppStore } from '../store';
import type {
  FilterParams,
  StrategyConfig,
  BacktestRequest,
  Bet,
} from '../types';

// Dashboard stats
export function useDashboardStats() {
  const setDashboardStats = useAppStore((state) => state.setDashboardStats);
  
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const stats = await api.getDashboardStats();
      setDashboardStats(stats);
      return stats;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

// Races
export function useRaces(params: FilterParams) {
  return useQuery({
    queryKey: ['races', params],
    queryFn: () => api.getRaces(params),
  });
}

export function useRace(id: string) {
  return useQuery({
    queryKey: ['race', id],
    queryFn: () => api.getRace(id),
    enabled: !!id,
  });
}

export function useQualifyingRaces(strategyId: string, params: FilterParams) {
  return useQuery({
    queryKey: ['qualifying-races', strategyId, params],
    queryFn: () => api.getQualifyingRaces(strategyId, params),
    enabled: !!strategyId,
  });
}

// Bets
export function useBets(params: FilterParams) {
  const setRecentBets = useAppStore((state) => state.setRecentBets);
  
  return useQuery({
    queryKey: ['bets', params],
    queryFn: async () => {
      const result = await api.getBets(params);
      setRecentBets(result.items);
      return result;
    },
  });
}

export function useBet(id: string) {
  return useQuery({
    queryKey: ['bet', id],
    queryFn: () => api.getBet(id),
    enabled: !!id,
  });
}

export function usePlaceBet() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (bet: Partial<Bet>) => api.placeBet(bet),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useCancelBet() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.cancelBet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

// Strategies
export function useStrategies() {
  const setStrategies = useAppStore((state) => state.setStrategies);
  
  return useQuery({
    queryKey: ['strategies'],
    queryFn: async () => {
      const strategies = await api.getStrategies();
      setStrategies(strategies);
      return strategies;
    },
  });
}

export function useStrategy(id: string) {
  return useQuery({
    queryKey: ['strategy', id],
    queryFn: () => api.getStrategy(id),
    enabled: !!id,
  });
}

export function useCreateStrategy() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (strategy: Partial<StrategyConfig>) => api.createStrategy(strategy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
    },
  });
}

export function useUpdateStrategy() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, strategy }: { id: string; strategy: Partial<StrategyConfig> }) =>
      api.updateStrategy(id, strategy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
    },
  });
}

export function useDeleteStrategy() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.deleteStrategy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
    },
  });
}

// Performance
export function useStrategyPerformance(strategyId: string, params?: FilterParams) {
  return useQuery({
    queryKey: ['performance', strategyId, params],
    queryFn: () => api.getStrategyPerformance(strategyId, params),
    enabled: !!strategyId,
  });
}

// Backtesting
export function useRunBacktest() {
  const queryClient = useQueryClient();
  const setCurrentBacktest = useAppStore((state) => state.setCurrentBacktest);
  
  return useMutation({
    mutationFn: (request: BacktestRequest) => api.runBacktest(request),
    onSuccess: (result) => {
      setCurrentBacktest(result);
      queryClient.invalidateQueries({ queryKey: ['backtest-results'] });
    },
  });
}

export function useBacktestResults() {
  const setBacktestResults = useAppStore((state) => state.setBacktestResults);
  
  return useQuery({
    queryKey: ['backtest-results'],
    queryFn: async () => {
      const results = await api.getBacktestResults();
      setBacktestResults(results);
      return results;
    },
  });
}

export function useBacktestResult(id: string) {
  return useQuery({
    queryKey: ['backtest-result', id],
    queryFn: () => api.getBacktestResult(id),
    enabled: !!id,
  });
}

// Data Import
export function useImportData() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (file: File) => api.importBetfairData(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['races'] });
    },
  });
}

// Courses
export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: () => api.getCourses(),
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}

// Local storage hook for persistence
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setValue] as const;
}

// Need to import useState for useLocalStorage
import { useState } from 'react';
