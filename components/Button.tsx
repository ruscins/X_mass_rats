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
  const baseStyle = "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-3 font-semibold transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f3c869] disabled:cursor-not-allowed disabled:opacity-50";
  
  let variantStyle = "";
  switch (variant) {
    case 'primary':
      variantStyle = "border border-[#b78020] bg-[#f3c869] text-[#17392c] hover:bg-[#ffda7c]";
      break;
    case 'secondary':
      variantStyle = "border border-[#cbd5cc] bg-white text-[#17392c] hover:bg-[#f1f5f0]";
      break;
    case 'danger':
      variantStyle = "border border-[#982f34] bg-[#a43636] text-white hover:bg-[#8f2d31]";
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