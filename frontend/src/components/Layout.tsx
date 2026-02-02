import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { cn } from '../utils';
import { useAppStore } from '../store';
import {
  LayoutDashboard,
  TrendingUp,
  Calendar,
  Settings,
  History,
  FlaskConical,
  Database,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Moon,
  Sun,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Races', href: '/races', icon: Calendar },
  { name: 'Bets', href: '/bets', icon: History },
  { name: 'Performance', href: '/performance', icon: TrendingUp },
  { name: 'Backtest', href: '/backtest', icon: FlaskConical },
  { name: 'Strategy', href: '/strategy', icon: Settings },
  { name: 'Data', href: '/data', icon: Database },
];

export const Layout: React.FC = () => {
  const location = useLocation();
  const { sidebarOpen, setSidebarOpen, theme, setTheme, bankroll } = useAppStore();
  
  return (
    <div className="min-h-screen bg-track-950 text-track-100">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-track-900 border-r border-track-800 transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-track-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-turf-500 to-turf-700 flex items-center justify-center shadow-lg shadow-turf-900/50">
              <span className="text-xl font-display font-bold text-white">T</span>
            </div>
            {sidebarOpen && (
              <div className="animate-fade-in">
                <h1 className="text-lg font-display font-semibold text-track-100">
                  Tumorra
                </h1>
                <p className="text-xs text-track-500">Lay Strategy</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group',
                  isActive
                    ? 'bg-turf-600/20 text-turf-400'
                    : 'text-track-400 hover:bg-track-800 hover:text-track-200'
                )}
              >
                <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-turf-400')} />
                {sidebarOpen && (
                  <span className="ml-3 font-medium animate-fade-in">{item.name}</span>
                )}
                {isActive && (
                  <div className="absolute left-0 w-1 h-8 bg-turf-500 rounded-r-full" />
                )}
              </NavLink>
            );
          })}
        </nav>
        
        {/* Bankroll Display */}
        {sidebarOpen && (
          <div className="px-4 py-3 mx-3 mb-3 bg-track-800/50 rounded-xl animate-fade-in">
            <p className="text-xs text-track-500 uppercase tracking-wider">Bankroll</p>
            <p className="text-lg font-mono font-semibold text-turf-400">
              £{bankroll.toLocaleString()}
            </p>
          </div>
        )}
        
        {/* Toggle Button */}
        <div className="p-3 border-t border-track-800">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center justify-center w-full p-2 text-track-400 hover:text-track-200 hover:bg-track-800 rounded-lg transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <div
        className={cn(
          'transition-all duration-300',
          sidebarOpen ? 'ml-64' : 'ml-20'
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-6 bg-track-950/80 backdrop-blur-lg border-b border-track-800">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-track-100">
              {navigation.find((n) => n.href === location.pathname)?.name || 'Dashboard'}
            </h2>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-track-400 hover:text-track-200 hover:bg-track-800 rounded-lg transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            {/* Notifications */}
            <button className="relative p-2 text-track-400 hover:text-track-200 hover:bg-track-800 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-turf-500 rounded-full" />
            </button>
            
            {/* Profile */}
            <div className="flex items-center space-x-3 pl-3 border-l border-track-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-silk-400 to-silk-600 flex items-center justify-center">
                <span className="text-sm font-medium text-track-900">C</span>
              </div>
              <button className="p-2 text-track-400 hover:text-track-200 hover:bg-track-800 rounded-lg transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
