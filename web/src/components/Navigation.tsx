// Simple Navigation Component
import React from 'react';
import Icon from './Icon';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
}

interface NavigationProps {
  items: NavItem[];
  className?: string;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  items, 
  className = '' 
}) => {
  return (
    <nav className={`nav ${className}`}>
      {items.map((item) => (
        <a
          key={item.id}
          href={item.href || '#'}
          onClick={(e) => {
            if (item.onClick) {
              e.preventDefault();
              item.onClick();
            }
          }}
          className={`nav-item ${item.active ? 'active' : ''}`}
        >
          <Icon name={item.icon} size="medium" />
          {item.label}
        </a>
      ))}
    </nav>
  );
};

export default Navigation;
