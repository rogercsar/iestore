// Simple Card Component
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: string;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  icon,
  className = '',
  onClick
}) => {
  const cardClasses = [
    'card',
    onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} onClick={onClick}>
      {(title || subtitle || icon) && (
        <div className="card-header mb-4">
          {icon && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{icon}</span>
              {title && <h3 className="text-xl font-semibold">{title}</h3>}
            </div>
          )}
          {!icon && title && <h3 className="text-xl font-semibold mb-2">{title}</h3>}
          {subtitle && <p className="text-gray-600 text-sm">{subtitle}</p>}
        </div>
      )}
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

export default Card;
