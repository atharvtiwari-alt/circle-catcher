import React from 'react';

interface CyberButtonProps {
  children: React.ReactNode;
  [key: string]: any;
}

export function CyberButton({ children, className = '', ...props }: CyberButtonProps) {
  return (
    <button {...props} className={`cyber-button ${className}`.trim()}>
      {children}
    </button>
  );
}
