import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  DashboardStats,
  StrategyConfig,
  Bet,
  BacktestResult,
  FilterParams,
} from '../types';

interface AppState {
  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  
  // Theme
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  
  // Dashboard
  dashboardStats: DashboardStats | null;
  setDashboardStats: (stats: DashboardStats) => void;
  
  // Strategies
  strategies: StrategyConfig[];
  activeStrategy: StrategyConfig | null;
  setStrategies: (strategies: StrategyConfig[]) => void;
  setActiveStrategy: (strategy: StrategyConfig | null) => void;
  
  // Bets
  recentBets: Bet[];
  setRecentBets: (bets: Bet[]) => void;
  
  // Backtest
  backtestResults: BacktestResult[];
  currentBacktest: BacktestResult | null;
  setBacktestResults: (results: BacktestResult[]) => void;
  setCurrentBacktest: (result: BacktestResult | null) => void;
  
  // Filters
  filters: FilterParams;
  setFilters: (filters: Partial<FilterParams>) => void;
  resetFilters: () => void;
  
  // Bankroll
  bankroll: number;
  setBankroll: (amount: number) => void;
}

const defaultFilters: FilterParams = {
  startDate: undefined,
  endDate: undefined,
  country: 'all',
  raceType: 'all',
  course: undefined,
  minOdds: 2.0,
  maxOdds: 4.5,
  page: 1,
  pageSize: 20,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // UI State
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      // Theme
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      
      // Dashboard
      dashboardStats: null,
      setDashboardStats: (stats) => set({ dashboardStats: stats }),
      
      // Strategies
      strategies: [],
      activeStrategy: null,
      setStrategies: (strategies) => set({ strategies }),
      setActiveStrategy: (strategy) => set({ activeStrategy: strategy }),
      
      // Bets
      recentBets: [],
      setRecentBets: (bets) => set({ recentBets: bets }),
      
      // Backtest
      backtestResults: [],
      currentBacktest: null,
      setBacktestResults: (results) => set({ backtestResults: results }),
      setCurrentBacktest: (result) => set({ currentBacktest: result }),
      
      // Filters
      filters: defaultFilters,
      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),
      resetFilters: () => set({ filters: defaultFilters }),
      
      // Bankroll
      bankroll: 100000,
      setBankroll: (amount) => set({ bankroll: amount }),
    }),
    {
      name: 'tumorra-storage',
      partialize: (state) => ({
        theme: state.theme,
        bankroll: state.bankroll,
        filters: state.filters,
      }),
    }
  )
);

// Derived selectors
export const useTheme = () => useAppStore((state) => state.theme);
export const useBankroll = () => useAppStore((state) => state.bankroll);
export const useFilters = () => useAppStore((state) => state.filters);
export const useActiveStrategy = () => useAppStore((state) => state.activeStrategy);
