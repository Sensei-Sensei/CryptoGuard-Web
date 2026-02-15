
import React from 'react';

interface IconButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

export const IconButton: React.FC<IconButtonProps> = ({ onClick, icon, label }) => {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 transition-colors duration-200"
    >
      {icon}
    </button>
  );
};
