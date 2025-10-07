// Simple Button Component
import React from 'react';
import Icon from './Icon';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'secondary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  className = ''
}) => {
  const baseClasses = 'button';
  const variantClasses = {
    primary: 'primary',
    secondary: '',
    danger: 'danger'
  };
  const sizeClasses = {
    small: 'text-sm p-2',
    medium: 'text-sm p-3',
    large: 'text-base p-4'
  };

  const buttonClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    loading ? 'loading' : '',
    className
  ].filter(Boolean).join(' ');

  const iconElement = icon ? (
    <Icon 
      name={icon} 
      size={size === 'small' ? 'small' : size === 'large' ? 'large' : 'medium'} 
    />
  ) : null;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={buttonClasses}
    >
      {loading && <span className="spinner" />}
      {!loading && iconElement && iconPosition === 'left' && iconElement}
      {!loading && children}
      {!loading && iconElement && iconPosition === 'right' && iconElement}
    </button>
  );
};

export default Button;
