import React from 'react';
import { soundEffects } from '../utils/sounds';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  onClick,
  ...props 
}) => {
  const baseStyle = "px-6 py-3 rounded-full font-bold shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100";
  
  let variantStyle = "";
  switch (variant) {
    case 'primary':
      variantStyle = "bg-xmas-gold text-xmas-darkRed hover:bg-yellow-400 hover:shadow-xl border-2 border-yellow-200";
      break;
    case 'secondary':
      variantStyle = "bg-white text-xmas-darkRed hover:bg-gray-100 hover:shadow-xl";
      break;
    case 'danger':
      variantStyle = "bg-red-800 text-white border border-red-400 hover:bg-red-900 hover:shadow-xl";
      break;
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!props.disabled) {
      soundEffects.click();
      onClick?.(e);
    }
  };

  return (
    <button className={`${baseStyle} ${variantStyle} ${className}`} onClick={handleClick} {...props}>
      {children}
    </button>
  );
};