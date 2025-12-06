import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  const baseStyle = "px-6 py-3 rounded-full font-bold shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  let variantStyle = "";
  switch (variant) {
    case 'primary':
      variantStyle = "bg-xmas-gold text-xmas-darkRed hover:bg-yellow-400 border-2 border-yellow-200";
      break;
    case 'secondary':
      variantStyle = "bg-white text-xmas-darkRed hover:bg-gray-100";
      break;
    case 'danger':
      variantStyle = "bg-red-800 text-white border border-red-400 hover:bg-red-900";
      break;
  }

  return (
    <button className={`${baseStyle} ${variantStyle} ${className}`} {...props}>
      {children}
    </button>
  );
};