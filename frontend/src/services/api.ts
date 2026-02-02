import axios, { AxiosInstance, AxiosResponse } from 'axios';
import type {
  ApiResponse,
  PaginatedResponse,
  Race,
  Bet,
  StrategyConfig,
  BacktestRequest,
  BacktestResult,
  DashboardStats,
  StrategyPerformance,
  QualifyingRace,
  FilterParams,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const response: AxiosResponse<ApiResponse<DashboardStats>> = 
      await this.client.get('/dashboard/stats');
    return response.data.data;
  }

  // Races
  async getRaces(params: FilterParams): Promise<PaginatedResponse<Race>> {
    const response: AxiosResponse<ApiResponse<PaginatedResponse<Race>>> = 
      await this.client.get('/races', { params });
    return response.data.data;
  }

  async getRace(id: string): Promise<Race> {
    const response: AxiosResponse<ApiResponse<Race>> = 
      await this.client.get(`/races/${id}`);
    return response.data.data;
  }

  async getQualifyingRaces(
    strategyId: string,
    params: FilterParams
  ): Promise<PaginatedResponse<QualifyingRace>> {
    const response: AxiosResponse<ApiResponse<PaginatedResponse<QualifyingRace>>> = 
      await this.client.get(`/races/qualifying/${strategyId}`, { params });
    return response.data.data;
  }

  // Bets
  async getBets(params: FilterParams): Promise<PaginatedResponse<Bet>> {
    const response: AxiosResponse<ApiResponse<PaginatedResponse<Bet>>> = 
      await this.client.get('/bets', { params });
    return response.data.data;
  }

  async getBet(id: string): Promise<Bet> {
    const response: AxiosResponse<ApiResponse<Bet>> = 
      await this.client.get(`/bets/${id}`);
    return response.data.data;
  }

  async placeBet(bet: Partial<Bet>): Promise<Bet> {
    const response: AxiosResponse<ApiResponse<Bet>> = 
      await this.client.post('/bets', bet);
    return response.data.data;
  }

  async cancelBet(id: string): Promise<Bet> {
    const response: AxiosResponse<ApiResponse<Bet>> = 
      await this.client.delete(`/bets/${id}`);
    return response.data.data;
  }

  // Strategies
  async getStrategies(): Promise<StrategyConfig[]> {
    const response: AxiosResponse<ApiResponse<StrategyConfig[]>> = 
      await this.client.get('/strategies');
    return response.data.data;
  }

  async getStrategy(id: string): Promise<StrategyConfig> {
    const response: AxiosResponse<ApiResponse<StrategyConfig>> = 
      await this.client.get(`/strategies/${id}`);
    return response.data.data;
  }

  async createStrategy(strategy: Partial<StrategyConfig>): Promise<StrategyConfig> {
    const response: AxiosResponse<ApiResponse<StrategyConfig>> = 
      await this.client.post('/strategies', strategy);
    return response.data.data;
  }

  async updateStrategy(id: string, strategy: Partial<StrategyConfig>): Promise<StrategyConfig> {
    const response: AxiosResponse<ApiResponse<StrategyConfig>> = 
      await this.client.put(`/strategies/${id}`, strategy);
    return response.data.data;
  }

  async deleteStrategy(id: string): Promise<void> {
    await this.client.delete(`/strategies/${id}`);
  }

  // Performance
  async getStrategyPerformance(
    strategyId: string,
    params?: FilterParams
  ): Promise<StrategyPerformance> {
    const response: AxiosResponse<ApiResponse<StrategyPerformance>> = 
      await this.client.get(`/performance/${strategyId}`, { params });
    return response.data.data;
  }

  // Backtesting
  async runBacktest(request: BacktestRequest): Promise<BacktestResult> {
    const response: AxiosResponse<ApiResponse<BacktestResult>> = 
      await this.client.post('/backtest', request);
    return response.data.data;
  }

  async getBacktestResults(): Promise<BacktestResult[]> {
    const response: AxiosResponse<ApiResponse<BacktestResult[]>> = 
      await this.client.get('/backtest/results');
    return response.data.data;
  }

  async getBacktestResult(id: string): Promise<BacktestResult> {
    const response: AxiosResponse<ApiResponse<BacktestResult>> = 
      await this.client.get(`/backtest/results/${id}`);
    return response.data.data;
  }

  // Data Import
  async importBetfairData(file: File): Promise<{ imported: number; errors: number }> {
    const formData = new FormData();
    formData.append('file', file);
    const response: AxiosResponse<ApiResponse<{ imported: number; errors: number }>> = 
      await this.client.post('/data/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    return response.data.data;
  }

  // Courses
  async getCourses(): Promise<string[]> {
    const response: AxiosResponse<ApiResponse<string[]>> = 
      await this.client.get('/courses');
    return response.data.data;
  }
}

export const api = new ApiService();
export default api;
