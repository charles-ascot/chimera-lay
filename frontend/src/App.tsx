import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import {
  Dashboard,
  Races,
  Bets,
  Performance,
  Backtest,
  Strategy,
  Data,
} from './pages';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="races" element={<Races />} />
            <Route path="bets" element={<Bets />} />
            <Route path="performance" element={<Performance />} />
            <Route path="backtest" element={<Backtest />} />
            <Route path="strategy" element={<Strategy />} />
            <Route path="data" element={<Data />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
