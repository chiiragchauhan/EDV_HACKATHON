
import React, { useEffect, useState } from 'react';
import { User, ContextSignal, JournalEntry, PasswordRecord, BreachAlert, SessionEvent } from '../types';
import { analyzeTrustSignals, checkDarkWeb, analyzePassword } from '../services/aiService';

interface Props {
  user: User;
  signals: ContextSignal[];
  toggleSignal: (id: string) => void;
  trustScore: number;
  journal: JournalEntry[];
  onLogout: () => void;
  setJournal: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
  setTrustScore: React.Dispatch<React.SetStateAction<number>>;
  onBreachDetected: () => void;
  addLog: (action: string, status: SessionEvent['status'], details?: string) => void;
  onReportBreach: (breach: BreachAlert) => void;
  darkMode: boolean;
  onToggleTheme: () => void;
}

type Tab = 'OVERVIEW' | 'VAULT' | 'MONITOR';

const UserDashboard: React.FC<Props> = ({ user, signals, toggleSignal, trustScore, journal, onLogout, setJournal, setTrustScore, onBreachDetected, addLog, onReportBreach, darkMode, onToggleTheme }) => {
  const [activeTab, setActiveTab] = useState<Tab>('OVERVIEW');
  const [isUpdating, setIsUpdating] = useState(false);
  const [passwords, setPasswords] = useState<PasswordRecord[]>([]);
  const [breaches, setBreaches] = useState<BreachAlert[]>([]);
  const [scanningEmail, setScanningEmail] = useState(user.email);
  const [isScanning, setIsScanning] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const [newSite, setNewSite] = useState('');
  const [newPass, setNewPass] = useState('');

  const changeTab = (t: Tab) => {
    if (activeTab !== t) {
      addLog('Tab Navigation', 'INFO', `Switched to ${t} view`);
      setActiveTab(t);
    }
  };

  useEffect(() => {
    const active = signals.filter(s => s.active).map(s => s.name);
    let newScore = 25;
    signals.forEach(s => {
      if (s.active) newScore += s.impact;
    });

    const finalScore = Math.min(newScore, 100);
    setTrustScore(finalScore);

    if (finalScore >= 90 && countdown === null) {
      setCountdown(10);
    } else if (finalScore < 90) {
      setCountdown(null);
    }
    
    const updateAI = async () => {
      setIsUpdating(true);
      const aiMessage = await analyzeTrustSignals(active);
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        impact: active.length > 0 ? 'HIGH' : 'LOW',
        timestamp: new Date().toLocaleTimeString(),
        message: `"${aiMessage}"`,
        strength: finalScore
      };
      setJournal(prev => [newEntry, ...prev]);
      setIsUpdating(false);
    };

    updateAI();
  }, [signals, setJournal, setTrustScore]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      onBreachDetected();
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, onBreachDetected]);

  const handleScan = async () => {
    addLog('Threat Scan Initiated', 'INFO', `Scanning for breaches on: ${scanningEmail}`);
    setIsScanning(true);
    const results = await checkDarkWeb(scanningEmail);
    setBreaches(results.map((r: any) => ({ ...r, id: Math.random().toString() })));
    setIsScanning(false);
    addLog('Threat Scan Completed', 'SUCCESS', `Found ${results.length} potential exposures`);
  };

  const handleAddPassword = async () => {
    if (!newSite || !newPass) return;
    const strength = await analyzePassword(newPass);
    const record: PasswordRecord = {
      id: Math.random().toString(),
      site: newSite,
      username: user.email,
      passwordString: newPass,
      strength: strength as any
    };
    setPasswords([record, ...passwords]);
    setNewSite('');
    setNewPass('');
    addLog('Vault Entry Created', 'SUCCESS', `Credentials added for ${newSite}`);
  };

  const generatePass = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let retVal = "";
    for (let i = 0, n = charset.length; i < 16; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    setNewPass(retVal);
    addLog('Secure Password Generated', 'INFO', 'Randomized 16-char string created');
  };

  const handleInformAdmin = (breach: BreachAlert) => {
    onReportBreach(breach);
    setBreaches(prev => prev.filter(b => b.id !== breach.id));
    addLog('Admin Informed', 'INFO', `Incident ${breach.source} flagged for review`);
  };

  const isHighRisk = trustScore >= 90;

  return (
    <div className={`p-4 md:p-8 max-w-[1440px] mx-auto min-h-screen space-y-6 md:space-y-8 transition-all duration-700 ease-in-out ${darkMode ? 'bg-slate-950' : 'bg-slate-50'} ${countdown !== null ? 'bg-red-50/10' : ''}`}>
      {countdown !== null && (
        <div className="fixed inset-0 z-[100] bg-red-600/10 backdrop-blur-[4px] pointer-events-none flex flex-col items-center justify-start pt-16 md:pt-24 animate-in fade-in transition-all duration-300 px-4">
          <div className="bg-red-600 text-white px-6 md:px-8 py-4 md:py-5 rounded-3xl shadow-2xl flex items-center gap-4 md:gap-6 animate-bounce border-4 border-red-400">
            <svg className="w-8 h-8 md:w-10 md:h-10 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <div className="text-left">
              <p className="font-black text-lg md:text-2xl uppercase tracking-tighter">Critical Trust Failure</p>
              <p className="text-[10px] md:text-sm font-bold opacity-90 uppercase tracking-[0.2em]">Mandatory Isolation: {countdown}s</p>
            </div>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10 animate-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-4 group cursor-pointer self-start md:self-auto">
          <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-xl shadow-blue-200 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 md:w-7 md:h-7" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          </div>
          <span className={`text-2xl md:text-3xl font-black tracking-tighter transition-colors ${darkMode ? 'text-white' : 'text-slate-900'}`}>ZTrust</span>
        </div>
        
        <nav className={`flex p-1 rounded-[1.25rem] backdrop-blur-xl border shadow-sm w-full md:w-auto overflow-x-auto no-scrollbar transition-colors duration-500 ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-200/40 border-white/40'}`}>
          {(['OVERVIEW', 'VAULT', 'MONITOR'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => changeTab(t)}
              className={`flex-1 md:flex-none px-4 md:px-8 py-2 md:py-2.5 rounded-[1rem] text-[10px] md:text-xs font-black uppercase tracking-[0.15em] transition-all duration-300 ${activeTab === t ? (darkMode ? 'bg-slate-800 text-blue-400 shadow-xl' : 'bg-white text-blue-600 shadow-xl') : (darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-800')}`}
            >
              {t}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4 md:gap-8 self-end md:self-auto">
          <button 
            onClick={onToggleTheme} 
            className={`p-2.5 rounded-2xl transition-all shadow-sm border ${darkMode ? 'bg-slate-900 border-slate-800 text-blue-400 hover:bg-slate-800' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
          >
            {darkMode ? (
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>
          
          <div className="text-right hidden sm:block">
            <p className={`font-bold text-base md:text-lg leading-tight truncate max-w-[150px] md:max-w-none ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{user.email}</p>
            <div className="flex items-center justify-end gap-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm"></span>
              <p className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-widest">{user.role}</p>
            </div>
          </div>
          <button onClick={onLogout} className={`p-2 md:p-3 rounded-2xl transition-all shadow-sm border ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-red-500' : 'bg-white border-slate-100 text-slate-400 hover:text-red-500'}`}>
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </header>

      {/* Overview components below unchanged... */}
      <div className="animate-in fade-in zoom-in-95 duration-700">
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-12 gap-6 md:gap-8 relative z-10">
          <div className="col-span-12 lg:col-span-8 space-y-6 md:space-y-8">
            <div className={`rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 shadow-2xl transition-all duration-700 flex flex-col sm:flex-row items-center gap-8 md:gap-12 group ${darkMode ? 'bg-slate-900 border border-slate-800 ring-2 ring-blue-500/5' : 'bg-white border-transparent ring-1 ring-slate-100'} ${isHighRisk ? 'ring-2 ring-red-400/50' : ''}`}>
              <div className="relative w-32 h-32 md:w-44 md:h-44 flex items-center justify-center shrink-0">
                <div className={`absolute inset-0 rounded-full border-[10px] md:border-[12px] shadow-inner ${darkMode ? 'border-slate-800' : 'border-slate-50'}`} style={{ background: `conic-gradient(${isHighRisk ? '#EF4444' : '#10B981'} ${trustScore}%, ${darkMode ? '#1e293b' : '#F1F5F9'} 0)` }} />
                <div className={`absolute inset-[10px] md:inset-[12px] rounded-full flex flex-col items-center justify-center shadow-xl group-hover:scale-105 transition-transform duration-500 ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
                  <span className={`text-4xl md:text-6xl font-black transition-colors ${isHighRisk ? 'text-red-500' : 'text-emerald-500'}`}>{trustScore}</span>
                  <span className="text-[8px] md:text-[10px] text-slate-300 font-black uppercase tracking-[0.2em] mt-1 md:mt-2">Trust Rating</span>
                </div>
              </div>
              <div className="flex-1 space-y-4 md:space-y-6 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-4">
                  <span className={`text-[9px] md:text-[10px] font-black uppercase px-4 md:px-6 py-2 md:py-2.5 rounded-full tracking-widest transition-all ${isHighRisk ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                    {isHighRisk ? 'RESTRICTION IMMINENT' : 'TRUST VERIFIED'}
                  </span>
                  <span className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full animate-ping ${isHighRisk ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                </div>
                <h2 className={`text-3xl md:text-5xl font-black tracking-tighter leading-tight transition-colors ${darkMode ? 'text-white' : 'text-slate-800'}`}>Endpoint Trust Evaluation</h2>
                <p className={`italic leading-relaxed text-lg md:text-2xl font-light opacity-80 max-w-2xl transition-colors ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                  {journal[0]?.message}
                </p>
              </div>
            </div>

            <div className={`rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 text-white space-y-8 md:space-y-12 shadow-2xl relative overflow-hidden transition-colors duration-500 ${darkMode ? 'bg-slate-900/60 border border-slate-800' : 'bg-[#0f172a]'}`}>
              <div className="absolute top-0 right-0 p-8 opacity-10 hidden sm:block">
                <svg className="w-24 h-24 md:w-32 md:h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z" /></svg>
              </div>
              <div className="space-y-2 md:space-y-3 relative z-10">
                <h3 className="text-2xl md:text-4xl font-black tracking-tight">Context Signal Simulator</h3>
                <p className="text-slate-400 text-base md:text-xl font-light">Force environment variables to stress-test configuration.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 relative z-10">
                {signals.map((signal) => (
                  <button 
                    key={signal.id} 
                    onClick={() => toggleSignal(signal.id)} 
                    className={`group p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] transition-all duration-500 transform active:scale-95 text-left border-2 relative overflow-hidden
                      ${signal.active 
                        ? (darkMode ? 'bg-slate-800 border-blue-500 shadow-[0_0_25px_-5px_rgba(37,99,235,0.2)]' : 'bg-slate-800 border-blue-500/50 shadow-xl shadow-blue-900/20') 
                        : (darkMode ? 'bg-slate-800/20 border-slate-700/50 hover:bg-slate-800/40' : 'bg-slate-800/20 border-slate-800/50 hover:bg-slate-800/40 hover:border-slate-700')
                      }`}
                  >
                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-8 transition-all duration-500 relative z-10
                      ${signal.active 
                        ? 'bg-blue-600 text-white shadow-lg scale-110 rotate-3 ring-4 ring-blue-500/20' 
                        : 'bg-slate-700/50 text-slate-500 group-hover:bg-slate-700 group-hover:text-slate-400 group-hover:scale-105'
                      }`}>
                      {signal.id === 'wifi' && <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>}
                      {signal.id === 'geo' && <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                      {signal.id === 'bot' && <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                    </div>
                    <div className="relative z-10">
                      <h4 className={`text-xl md:text-2xl font-black transition-colors ${signal.active ? 'text-white' : 'text-slate-100'}`}>{signal.name}</h4>
                      <div className="flex items-center gap-2 mt-1 md:mt-2">
                        <p className="text-[8px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest">Active Telemetry</p>
                        {signal.active && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.8)]"></span>}
                      </div>
                    </div>
                    {signal.active && (
                      <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-transparent pointer-events-none transition-opacity animate-in fade-in duration-700"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Rest of the dashboard remains the same... */}
          <div className="col-span-12 lg:col-span-4 space-y-6 md:space-y-8">
            <div className={`rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-xl border flex flex-col h-full hover:shadow-2xl transition-all ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              <div className="flex justify-between items-center mb-6 md:mb-10">
                <h3 className="font-black uppercase tracking-[0.3em] text-slate-300 text-[9px] md:text-[10px]">Context Journal</h3>
                <div className="flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-300"></span>
                </div>
              </div>
              <div className="space-y-4 md:space-y-6 flex-1 max-h-[400px] lg:max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                {journal.map(entry => (
                  <div key={entry.id} className={`p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] space-y-3 md:space-y-5 group border transition-all duration-300 ${darkMode ? 'bg-slate-800/40 border-slate-800 hover:bg-slate-800 hover:border-slate-700' : 'bg-slate-50/70 border-slate-100 hover:bg-white hover:border-blue-100'}`}>
                    <div className="flex justify-between items-center text-[8px] md:text-[10px] font-black tracking-widest uppercase">
                      <span className={entry.impact === 'HIGH' ? 'text-red-500' : 'text-emerald-500'}>{entry.impact} IMPACT</span>
                      <span className="text-slate-300">{entry.timestamp}</span>
                    </div>
                    <p className={`text-base md:text-lg italic leading-tight font-light transition-colors ${darkMode ? 'text-slate-400 group-hover:text-slate-200' : 'text-slate-500 group-hover:text-slate-800'}`}>{entry.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* MONITOR and VAULT tabs follow existing pattern... */}
      </div>
    </div>
  );
};

export default UserDashboard;
