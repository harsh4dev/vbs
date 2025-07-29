import React from 'react';

export default function Button({ children, className = '', ...props }) {
  return (
    <button
      className={`py-3 px-6 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all disabled:opacity-50 shadow-md ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}