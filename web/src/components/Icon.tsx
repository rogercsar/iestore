// Simple Icon Component using Unicode symbols
import React from 'react';

interface IconProps {
  name: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const iconMap: Record<string, string> = {
  // Navigation
  home: '🏠',
  dashboard: '📊',
  inventory: '📦',
  sell: '💰',
  history: '📋',
  settings: '⚙️',
  
  // Actions
  add: '➕',
  edit: '✏️',
  delete: '🗑️',
  save: '💾',
  cancel: '❌',
  check: '✅',
  search: '🔍',
  menu: '☰',
  close: '✕',
  
  // Arrows
  'arrow-left': '←',
  'arrow-right': '→',
  'arrow-up': '↑',
  'arrow-down': '↓',
  
  // Status
  info: 'ℹ️',
  warning: '⚠️',
  error: '❌',
  success: '✅',
  
  // User
  user: '👤',
  users: '👥',
  
  // Business
  chart: '📈',
  graph: '📊',
  data: '📋',
  money: '💰',
  cart: '🛒',
  store: '🏪',
  
  // Default fallback
  default: '●'
};

const sizeMap = {
  small: '14px',
  medium: '18px',
  large: '24px'
};

export const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 'medium', 
  className = '' 
}) => {
  const iconSymbol = iconMap[name] || iconMap.default;
  const iconSize = sizeMap[size];
  
  return (
    <span 
      className={`icon icon-${size} ${className}`}
      style={{ fontSize: iconSize }}
      role="img"
      aria-label={name}
    >
      {iconSymbol}
    </span>
  );
};

export default Icon;
