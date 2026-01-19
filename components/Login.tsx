
import React, { useState } from 'react';

interface Props {
  onLogin: (email: string) => void;
  darkMode: boolean;
  onToggleTheme: () => void;
}

const Login: React.FC<Props> = ({ onLogin, darkMode, onToggleTheme }) => {
  const [email, setEmail] = useState('demo@ztrust.io');
  const [password, setPassword] = useState('password123');

  return (
    <div className={`flex flex-col min-h-screen transition-colors duration-500 ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <header className={`${darkMode ? 'bg-slate-900 border-b border-slate-800' : 'bg-[#1C1C1C]'} text-white p-3 flex justify-between items-center px-4 md:px-6`}>
        <h1 className="text-xs md:text-sm font-medium">ZTrust - AI Zero-Trust Access Controller</h1>
        <div className="flex items-center gap-4 text-xs opacity-80">
          <button onClick={onToggleTheme} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            {darkMode ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>
          <div className="hidden sm:flex items-center gap-4">
            <span className="flex items-center gap-1 cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Device
            </span>
            <svg className="w-4 h-4 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className={`${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white shadow-2xl'} rounded-[2rem] w-full max-w-md p-6 md:p-10 space-y-6 md:space-y-8 animate-in fade-in zoom-in-95 duration-500`}>
          <div className="text-center space-y-2">
            <h2 className={`text-2xl md:text-3xl font-bold ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>Secure Login</h2>
            <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} text-sm leading-relaxed px-2 md:px-4`}>
              Welcome to ZTrust. Your identity and device are being verified in real-time.
            </p>
          </div>

          <form className="space-y-4 md:space-y-6" onSubmit={(e) => { e.preventDefault(); onLogin(email); }}>
            <div className="space-y-2">
              <label className={`text-xs font-semibold uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>Work Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full p-3 md:p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-100 text-slate-600'}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`text-xs font-semibold uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full p-3 md:p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all tracking-widest ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-100 text-slate-600'}`}
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-[#2563EB] hover:bg-blue-600 text-white font-semibold p-3 md:p-4 rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
              Sign In Securely
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mt-6">
            <div className={`p-3 md:p-4 rounded-xl border cursor-pointer transition-colors ${darkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-750' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}`} onClick={() => setEmail('demo@ztrust.io')}>
              <p className={`text-[9px] font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>User Account</p>
              <p className={`text-xs md:text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>demo@ztrust.io</p>
            </div>
            <div className={`p-3 md:p-4 rounded-xl border cursor-pointer transition-colors ${darkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-750' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}`} onClick={() => setEmail('admin@ztrust.io')}>
              <p className={`text-[9px] font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Admin Account</p>
              <p className={`text-xs md:text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>admin@ztrust.io</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
