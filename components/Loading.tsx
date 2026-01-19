
import React from 'react';

interface Props {
  darkMode?: boolean;
}

const Loading: React.FC<Props> = ({ darkMode }) => {
  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <p className={`text-lg italic animate-pulse font-light ${darkMode ? 'text-blue-400' : 'text-slate-400'}`}>Establishing encrypted identity tunnel...</p>
    </div>
  );
};

export default Loading;
