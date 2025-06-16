
import React from 'react';

interface AlertProps {
  message: string;
  type: 'error' | 'success' | 'info';
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ message, type, onClose }) => {
  const baseClasses = 'p-4 rounded-md shadow-lg flex justify-between items-center';
  const typeClasses = {
    error: 'bg-red-500 text-white',
    success: 'bg-green-500 text-white',
    info: 'bg-blue-500 text-white',
  };

  if (!message) return null;

  return (
    <div className={`${baseClasses} ${typeClasses[type]} mb-4`}>
      <span>{message}</span>
      {onClose && (
        <button 
          onClick={onClose} 
          className="ml-4 text-xl font-bold hover:text-slate-200"
          aria-label="Close alert"
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default Alert;
