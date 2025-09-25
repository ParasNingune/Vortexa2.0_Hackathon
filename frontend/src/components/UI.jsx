import React from 'react';

export function LoadingSpinner({ size = 'md', color = 'green' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colors = {
    green: 'border-green-500',
    blue: 'border-blue-500',
    purple: 'border-purple-500',
    gray: 'border-gray-500'
  };

  return (
    <div className={`${sizes[size]} border-2 ${colors[color]} border-t-transparent rounded-full animate-spin`}></div>
  );
}

export function SkeletonLoader({ className = '', lines = 3 }) {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`bg-gray-200 rounded-lg h-4 mb-3 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}></div>
      ))}
    </div>
  );
}

export function PulsingDot({ color = 'green', size = 'sm' }) {
  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const colors = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500'
  };

  return (
    <div className={`${sizes[size]} ${colors[color]} rounded-full animate-ping`}></div>
  );
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  className = '',
  ...props 
}) {
  const baseClasses = 'font-semibold rounded-xl transition-all duration-300 flex items-center justify-center space-x-2';
  
  const variants = {
    primary: 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl',
    secondary: 'bg-white text-green-600 border-2 border-green-600 hover:bg-green-50',
    outline: 'border-2 border-gray-300 text-gray-700 hover:border-green-500 hover:text-green-600',
    danger: 'bg-red-500 text-white hover:bg-red-600'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed hover:transform-none';

  return (
    <button
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${disabled ? disabledClasses : 'transform hover:scale-105'}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" color="white" />}
      {children}
    </button>
  );
}

export function Card({ children, className = '', variant = 'default', hover = true }) {
  const variants = {
    default: 'bg-white border border-gray-200',
    glass: 'glass-effect',
    gradient: 'bg-gradient-to-br from-white to-gray-50',
    elevated: 'bg-white shadow-lg'
  };

  const hoverEffect = hover ? 'hover-lift' : '';

  return (
    <div className={`${variants[variant]} ${hoverEffect} rounded-2xl p-6 ${className}`}>
      {children}
    </div>
  );
}

export function Badge({ children, variant = 'default', size = 'md' }) {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span className={`${variants[variant]} ${sizes[size]} rounded-full font-medium inline-flex items-center`}>
      {children}
    </span>
  );
}

export function Progress({ value, max = 100, color = 'green' }) {
  const colors = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500'
  };

  const percentage = (value / max) * 100;

  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`h-2 rounded-full transition-all duration-500 ${colors[color]}`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
}

export function ProgressBar({ progress = 0, className = '', color = 'green', showLabel = true }) {
  const colors = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500'
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`${colors[color]} h-2.5 rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}

export function Toast({ message, type = 'info', onClose }) {
  const types = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    error: 'bg-red-50 text-red-800 border-red-200'
  };

  const icons = {
    info: '🛈',
    success: '✓',
    warning: '⚠',
    error: '✕'
  };

  return (
    <div className={`${types[type]} border rounded-lg p-4 mb-4 animate-slide-up`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{icons[type]}</span>
          <span className="font-medium">{message}</span>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
