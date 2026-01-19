
import React, { useState, useEffect } from 'react';

interface Props {
  onAcknowledge: () => void;
  darkMode?: boolean;
}

const Restricted: React.FC<Props> = ({ onAcknowledge, darkMode }) => {
  const [seconds, setSeconds] = useState(566); // 09:26

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')} : ${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${darkMode ? 'bg-slate-900' : 'bg-[#333742]'}`}>
      <div className={`rounded-[3.5rem] border-[3px] w-full max-w-lg p-12 text-center shadow-2xl relative overflow-hidden transition-colors ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-pink-100'}`}>
        <div className="bg-[#FF4D6D] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-10 shadow-xl shadow-pink-200 animate-bounce">
           <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>

        <div className="space-y-6">
           <h2 className={`text-3xl font-black tracking-wider uppercase ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>Device Restricted</h2>
           <p className={`text-sm leading-relaxed max-w-[320px] mx-auto font-medium ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>
             This device has been temporarily restricted due to multiple trust violations. Access will be restored shortly.
           </p>
        </div>

        <div className={`mt-12 rounded-[2.5rem] p-10 space-y-4 border shadow-inner transition-colors ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-100/50'}`}>
           <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em]">Cooling Period Remaining</p>
           <div className={`text-7xl font-black tracking-tighter transition-colors ${darkMode ? 'text-blue-500' : 'text-[#0F172A]'}`}>
             {formatTime(seconds)}
           </div>
        </div>

        <button 
          onClick={onAcknowledge}
          className="mt-12 w-full bg-[#0F172A] hover:bg-slate-800 text-white font-black text-xs uppercase tracking-[0.3em] py-6 rounded-2xl shadow-xl transition-all transform active:scale-[0.98]"
        >
          Acknowledge
        </button>
      </div>
    </div>
  );
};

export default Restricted;
