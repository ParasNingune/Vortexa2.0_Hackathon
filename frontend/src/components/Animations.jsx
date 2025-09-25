import React from 'react';

export function FadeIn({ children, delay = 0, duration = 500, className = '' }) {
  return (
    <div
      className={`animate-fade-in ${className}`}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
        animationFillMode: 'both'
      }}
    >
      {children}
    </div>
  );
}

export function SlideUp({ children, delay = 0, duration = 500, className = '' }) {
  return (
    <div
      className={`animate-slide-up ${className}`}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
        animationFillMode: 'both'
      }}
    >
      {children}
    </div>
  );
}

export function ScaleIn({ children, delay = 0, duration = 300, className = '' }) {
  return (
    <div
      className={`animate-scale-in ${className}`}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
        animationFillMode: 'both'
      }}
    >
      {children}
    </div>
  );
}
