import React from 'react';

interface InputProps {
  id: string;
  type?: string;
  className?: string;
  [key: string]: any;
}

export const Input: React.FC<InputProps> = ({ id, type = 'text', className = '', ...props }) => {
  return (
    <input
      id={id}
      type={type}
      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${className}`}
      {...props}
    />
  );
};
