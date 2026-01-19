
import React, { useState, useEffect } from 'react';

interface Props {
  onVerify: () => void;
  email: string;
  darkMode?: boolean;
}

const TwoFactor: React.FC<Props> = ({ onVerify, email, darkMode }) => {
  const [code, setCode] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('891794');

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-500 relative overflow-hidden ${darkMode ? 'bg-slate-950' : 'bg-[#F1F5F9]'}`}>
      {/* Simulated Notification Overlay */}
      <div className={`fixed top-4 transition-all duration-500 transform ${showNotification ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'} z-50 w-full max-w-lg px-4`}>
        <div className="bg-[#1C1C1E] text-white rounded-2xl p-4 shadow-2xl flex items-center gap-4">
          <div className="bg-white p-2 rounded-xl">
             <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" className="w-8 h-8" alt="Gmail" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center text-xs opacity-60">
              <span>Gmail • just now</span>
              <span className="bg-slate-700 px-1.5 rounded text-[10px] tracking-widest font-bold">SIMULATED</span>
            </div>
            <p className="font-bold text-sm">Security Alert: {email}</p>
            <p className="text-xs opacity-80">Your ZTrust verification code is <span className="text-blue-400 font-mono font-bold text-sm">{verificationCode}</span></p>
          </div>
          <div className="flex gap-3">
             <button className="opacity-60 hover:opacity-100"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg></button>
             <button onClick={() => setShowNotification(false)} className="opacity-60 hover:opacity-100"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
        </div>
      </div>

      <div className={`${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white shadow-2xl'} rounded-[2.5rem] w-full max-w-md p-10 py-16 text-center space-y-8 relative z-10`}>
        <div className={`${darkMode ? 'bg-slate-800' : 'bg-slate-50'} w-20 h-20 rounded-full flex items-center justify-center mx-auto`}>
          <svg className={`w-10 h-10 ${darkMode ? 'text-blue-400' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </div>

        <div className="space-y-4">
          <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>Verify Identity</h2>
          <p className={`${darkMode ? 'text-slate-400' : 'text-slate-400'} text-sm max-w-[240px] mx-auto leading-relaxed`}>
            Enter the 6-digit security code from your primary device notification.
          </p>
        </div>

        <div className="relative group">
          <input 
            type="text" 
            maxLength={6}
            placeholder=". . . | . . ."
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className={`w-full border-2 rounded-2xl p-6 text-center text-3xl font-mono tracking-[0.5em] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all placeholder:text-slate-200 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-100'}`}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] font-bold tracking-wider">
          <button className="text-blue-600 hover:text-blue-700 uppercase">Resend Notification</button>
          <span className="text-slate-400 uppercase">Expires: 04:59</span>
        </div>

        <div className="space-y-4 pt-4">
          <button 
            disabled={code.length !== 6}
            onClick={onVerify}
            className={`w-full disabled:opacity-50 font-bold p-5 rounded-2xl uppercase tracking-widest transition-all shadow-sm ${darkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-400 hover:bg-blue-600 hover:text-white'}`}
          >
            Authorize Access
          </button>
          <button className={`w-full text-xs font-bold uppercase tracking-widest transition-colors ${darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>
            Decline Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default TwoFactor;
