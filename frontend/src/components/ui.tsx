import React from 'react';
import { cn } from '../utils';

// Card Component
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-track-900 border border-track-800',
      elevated: 'bg-track-900 shadow-xl shadow-black/20',
      outlined: 'bg-transparent border border-track-700',
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl p-6',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-turf-600 hover:bg-turf-500 text-white shadow-lg shadow-turf-900/30',
      secondary: 'bg-track-700 hover:bg-track-600 text-track-100',
      ghost: 'bg-transparent hover:bg-track-800 text-track-300',
      danger: 'bg-loss/90 hover:bg-loss text-white',
    };
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };
    
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-turf-500/50 focus:ring-offset-2 focus:ring-offset-track-950',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-track-300">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-track-500">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-track-800 border border-track-700 rounded-lg px-4 py-2.5',
              'text-track-100 placeholder-track-500',
              'focus:outline-none focus:ring-2 focus:ring-turf-500/50 focus:border-turf-500',
              'transition-colors duration-200',
              icon && 'pl-10',
              error && 'border-loss focus:border-loss focus:ring-loss/50',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-sm text-loss">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

// Select Component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-track-300">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full bg-track-800 border border-track-700 rounded-lg px-4 py-2.5',
            'text-track-100',
            'focus:outline-none focus:ring-2 focus:ring-turf-500/50 focus:border-turf-500',
            'transition-colors duration-200',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
);
Select.displayName = 'Select';

// Badge Component
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  ...props
}) => {
  const variants = {
    default: 'bg-track-700 text-track-200',
    success: 'bg-profit/20 text-profit',
    warning: 'bg-pending/20 text-pending',
    danger: 'bg-loss/20 text-loss',
    info: 'bg-blue-500/20 text-blue-400',
  };
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    />
  );
};

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  loading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  loading,
}) => {
  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-track-400">{title}</p>
          {loading ? (
            <div className="h-8 w-24 bg-track-800 rounded animate-pulse" />
          ) : (
            <p className="text-2xl font-semibold text-track-100 font-mono">
              {value}
            </p>
          )}
          {change !== undefined && (
            <p
              className={cn(
                'text-sm font-medium',
                change >= 0 ? 'text-profit' : 'text-loss'
              )}
            >
              {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(2)}%
              {changeLabel && (
                <span className="text-track-500 ml-1">{changeLabel}</span>
              )}
            </p>
          )}
        </div>
        {icon && (
          <div className="p-2 bg-track-800 rounded-lg text-track-400">
            {icon}
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-turf-500/5 to-transparent pointer-events-none" />
    </Card>
  );
};

// Table Component
interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export function Table<T extends { id: string }>({
  columns,
  data,
  loading,
  emptyMessage = 'No data available',
  onRowClick,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-14 bg-track-800 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }
  
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-track-500">
        <p>{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-track-800">
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={cn(
                  'px-4 py-3 text-left text-xs font-medium text-track-400 uppercase tracking-wider',
                  column.className
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-track-800">
          {data.map((item) => (
            <tr
              key={item.id}
              className={cn(
                'hover:bg-track-800/50 transition-colors',
                onRowClick && 'cursor-pointer'
              )}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className={cn(
                    'px-4 py-4 text-sm text-track-200',
                    column.className
                  )}
                >
                  {column.render
                    ? column.render(item)
                    : String(item[column.key as keyof T] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Spinner Component
export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };
  
  return (
    <svg
      className={cn('animate-spin text-turf-500', sizes[size])}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

// Tabs Component
interface TabsProps {
  tabs: { id: string; label: string; count?: number }[];
  activeTab: string;
  onChange: (id: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="flex space-x-1 bg-track-900 p-1 rounded-lg">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-md transition-all duration-200',
            activeTab === tab.id
              ? 'bg-track-700 text-track-100'
              : 'text-track-400 hover:text-track-200'
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                'ml-2 px-1.5 py-0.5 text-xs rounded',
                activeTab === tab.id
                  ? 'bg-track-600'
                  : 'bg-track-800'
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

// Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  if (!isOpen) return null;
  
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 text-center">
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />
        <span className="inline-block h-screen align-middle">&#8203;</span>
        <div
          className={cn(
            'inline-block w-full text-left align-middle transition-all',
            'bg-track-900 rounded-2xl shadow-2xl border border-track-800',
            sizes[size]
          )}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-track-800">
            <h3 className="text-lg font-semibold text-track-100">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 text-track-400 hover:text-track-200 hover:bg-track-800 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
};
