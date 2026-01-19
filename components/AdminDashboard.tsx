
import React, { useState, useMemo, useEffect } from 'react';
import { User, SessionEvent, BreachAlert, ApiMetric } from '../types';
import { getSOCAdvice } from '../services/aiService';

interface Props {
  user: User;
  onLogout: () => void;
  restrictedUsers: string[];
  onRevoke: (email: string) => void;
  sessionLogs: SessionEvent[];
  reportedBreaches: (BreachAlert & { reporter: string })[];
  apiMetrics: ApiMetric[];
  darkMode: boolean;
  onToggleTheme: () => void;
}

type AdminTab = 'ENDPOINTS' | 'LOGS' | 'THREATS' | 'API_MONITOR';

const AdminDashboard: React.FC<Props> = ({ user, onLogout, restrictedUsers, onRevoke, sessionLogs, reportedBreaches, apiMetrics, darkMode, onToggleTheme }) => {
  const [adminTab, setAdminTab] = useState<AdminTab>('ENDPOINTS');
  const [socAdvice, setSocAdvice] = useState<string>("Analyzing current telemetry...");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const allUsers = ['demo@ztrust.io', 'support@ztrust.io'];

  useEffect(() => {
    const fetchAdvice = async () => {
      setIsAnalyzing(true);
      const advice = await getSOCAdvice(sessionLogs, reportedBreaches);
      setSocAdvice(advice);
      setIsAnalyzing(false);
    };
    fetchAdvice();
  }, [sessionLogs.length, reportedBreaches.length]);

  const metricsSummary = useMemo(() => {
    if (apiMetrics.length === 0) return { total: 0, avgDuration: 0, errorRate: 0 };
    const total = apiMetrics.length;
    const errors = apiMetrics.filter(m => m.status === 'ERROR').length;
    const sumDuration = apiMetrics.reduce((acc, curr) => acc + curr.duration, 0);
    return {
      total,
      avgDuration: Math.round(sumDuration / total),
      errorRate: Math.round((errors / total) * 100)
    };
  }, [apiMetrics]);

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'bg-slate-950' : 'bg-[#F8FAFC]'}`}>
       <header className={`backdrop-blur-md border-b p-3 px-4 md:p-4 md:px-10 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm sticky top-0 z-50 transition-colors duration-500 ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-100'}`}>
          <div className="flex items-center gap-4 group cursor-pointer self-start sm:self-auto">
             <div className="bg-[#2563EB] p-2 md:p-2.5 rounded-xl md:rounded-2xl text-white shadow-lg shadow-blue-500/20 group-hover:rotate-12 transition-transform">
               <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
             </div>
             <span className={`text-xl md:text-2xl font-black tracking-tighter transition-colors ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>ZTrust SOC</span>
          </div>

          <nav className={`flex p-1 rounded-2xl w-full sm:w-auto overflow-x-auto no-scrollbar transition-colors ${darkMode ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
            {(['ENDPOINTS', 'LOGS', 'THREATS', 'API_MONITOR'] as AdminTab[]).map(t => (
              <button
                key={t}
                onClick={() => setAdminTab(t)}
                className={`flex-1 sm:flex-none px-4 md:px-8 py-2 rounded-[1rem] text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${adminTab === t ? (darkMode ? 'bg-slate-700 text-blue-400 shadow-md' : 'bg-white text-blue-600 shadow-md') : 'text-slate-500 hover:text-slate-800'}`}
              >
                {t.replace('_', ' ')}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-6 md:gap-10 self-end sm:self-auto">
             <button onClick={onToggleTheme} className={`p-2 md:p-2.5 rounded-xl md:rounded-2xl transition-all shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700 text-blue-400 hover:bg-slate-750' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}>
               {darkMode ? (
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
               ) : (
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
               )}
             </button>

             <div className="text-right hidden md:block">
                <p className={`text-sm md:text-base font-bold leading-tight truncate max-w-[150px] transition-colors ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>{user.email}</p>
                <div className="flex items-center justify-end gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm animate-pulse"></span>
                  <p className="text-[8px] md:text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none">Global SOC Admin</p>
                </div>
             </div>
             <button onClick={onLogout} className={`p-2 md:p-3 rounded-xl md:rounded-2xl transition-all shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-red-500' : 'bg-white border-slate-100 text-slate-300 hover:text-red-500'}`}>
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
             </button>
          </div>
       </header>

       <main className="p-4 md:p-10 max-w-[1600px] mx-auto space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-2 md:space-y-3">
              <h1 className={`text-4xl md:text-6xl font-black tracking-tighter leading-none transition-colors ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
                {adminTab === 'ENDPOINTS' ? 'HUB OVERVIEW' : adminTab === 'LOGS' ? 'GLOBAL ACTIVITY' : adminTab === 'THREATS' ? 'REPORTED THREATS' : 'API ANALYTICS'}
              </h1>
              <p className="text-slate-400 italic text-lg md:text-xl font-light truncate">Enterprise Audit Control Plane v4.5.1-stable</p>
            </div>
            <div className={`hidden sm:flex items-center gap-3 border px-6 md:px-8 py-3 md:py-4 rounded-[2rem] shadow-sm transition-all ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
               <span className="w-3 h-3 md:w-3.5 md:h-3.5 rounded-full bg-emerald-400 animate-ping opacity-75"></span>
               <span className={`text-[10px] md:text-xs font-black uppercase tracking-[0.3em] ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Telemetry Synchronized</span>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6 md:gap-10">
             {adminTab === 'ENDPOINTS' && (
               <>
                 <div className="col-span-12 lg:col-span-8 space-y-8 md:space-y-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10">
                       {allUsers.map(email => {
                         const isRestricted = restrictedUsers.includes(email);
                         return (
                            <div key={email} className={`rounded-[3.5rem] p-8 md:p-12 border-2 md:border-4 shadow-2xl relative group cursor-pointer overflow-hidden transition-all duration-500 hover:scale-[1.01] ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-50'} ${isRestricted ? 'border-red-500/40 shadow-red-500/10' : ''}`}>
                              <div className="flex justify-between items-start gap-4">
                                 <div className={`p-6 md:p-8 rounded-[2rem] transition-colors shrink-0 ${isRestricted ? 'bg-red-500/10 text-red-500' : (darkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-300')}`}>
                                   <svg className="w-8 h-8 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                 </div>
                                 <div className="text-right space-y-2 md:space-y-3 min-w-0">
                                    <span className={`font-black text-[8px] md:text-[10px] uppercase tracking-[0.2em] px-3 md:px-5 py-1.5 md:py-2 rounded-full shadow-sm block truncate ${isRestricted ? 'bg-red-500 text-white' : (darkMode ? 'bg-emerald-500/10 text-emerald-500' : 'bg-emerald-50 text-emerald-600')}`}>
                                      {isRestricted ? 'ISOLATED' : 'TRUSTED NODE'}
                                    </span>
                                    {isRestricted && <div className="text-red-500 border-2 border-red-200 rounded-xl px-4 py-1.5 text-lg md:text-2xl font-black font-mono animate-pulse">BREACH</div>}
                                 </div>
                              </div>

                              <div className="mt-8 md:mt-10 space-y-1">
                                 <h3 className={`text-2xl md:text-3xl font-black tracking-tight truncate ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>{email}</h3>
                                 <p className="text-[8px] md:text-[10px] text-slate-500 font-black tracking-[0.4em] uppercase">SYSTEM ID: {Math.random().toString(16).substring(2, 10).toUpperCase()}</p>
                              </div>

                              <div className="mt-8 md:mt-12 flex gap-3 md:gap-4">
                                <button 
                                  disabled={!isRestricted}
                                  onClick={() => onRevoke(email)} 
                                  className={`flex-1 font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] py-4 md:py-6 rounded-3xl flex items-center justify-center gap-2 md:gap-4 shadow-xl transition-all ${isRestricted ? 'bg-red-500 text-white shadow-red-500/20 hover:bg-red-600' : (darkMode ? 'bg-slate-800 text-slate-600' : 'bg-slate-100 text-slate-300 cursor-not-allowed')}`}
                                >
                                   <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                                   {isRestricted ? 'Revoke Isolation' : 'Auth Verified'}
                                </button>
                                <button className={`p-4 md:p-6 rounded-3xl flex items-center justify-center w-16 md:w-24 transition-all ${darkMode ? 'bg-slate-800 text-slate-500 hover:bg-slate-750' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                                   <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                                </button>
                              </div>
                           </div>
                         )
                       })}
                    </div>
                 </div>

                 <div className="col-span-12 lg:col-span-4 space-y-8 md:space-y-10">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.5em] ml-1">AI SOC Advisor</h2>
                    <div className={`rounded-[3rem] h-[500px] lg:h-[680px] overflow-hidden flex flex-col shadow-2xl p-6 md:p-10 space-y-6 md:space-y-8 relative transition-colors ${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-[#0F172A]'}`}>
                       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 animate-gradient-x opacity-80"></div>
                       <div className={`p-6 md:p-10 border-l-[6px] border-blue-500 rounded-[2rem] space-y-4 ${darkMode ? 'bg-blue-500/5' : 'bg-blue-500/10'}`}>
                          <div className="flex items-center gap-2">
                             <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] block">SOC Advisory Feed</span>
                             {isAnalyzing && <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>}
                          </div>
                          <p className={`text-lg md:text-xl leading-snug font-light italic ${darkMode ? 'text-slate-300' : 'text-blue-100'}`}>
                            "{socAdvice}"
                          </p>
                       </div>
                       <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6 md:space-y-8">
                         <div className="space-y-2 opacity-50">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recent Events Summary</p>
                            <p className="text-xs text-slate-400 font-mono leading-relaxed">
                              - ${sessionLogs.length} authentication events logged.<br/>
                              - ${reportedBreaches.length} security flags raised by endpoints.<br/>
                              - ${apiMetrics.filter(m => m.status === 'ERROR').length} API anomalies detected.
                            </p>
                         </div>
                         <div className="h-px bg-slate-800/50"></div>
                         {reportedBreaches.slice(0, 10).map((rb, idx) => (
                            <div key={idx} className={`p-6 border-l-[4px] border-amber-500/50 rounded-[1.5rem] space-y-2 transition-all hover:bg-white/5 cursor-default ${darkMode ? 'bg-amber-500/5' : 'bg-amber-950/20'}`}>
                               <p className="text-amber-500 text-[9px] font-black uppercase tracking-widest">Incident Record</p>
                               <p className="text-slate-400 text-sm italic font-light truncate">"{rb.source} - reported by {rb.reporter.split('@')[0]}"</p>
                            </div>
                         ))}
                         {reportedBreaches.length === 0 && (
                            <div className={`p-6 border-l-[4px] border-emerald-500/50 rounded-[1.5rem] ${darkMode ? 'bg-emerald-500/5' : 'bg-emerald-800/20'}`}>
                               <p className="text-emerald-500 text-[9px] font-black uppercase tracking-widest mb-1">Status</p>
                               <p className="text-slate-400 text-sm italic font-light">Zero reported manual incidents in current buffer.</p>
                            </div>
                         )}
                    </div>
                 </div>
               </div>
               </>
             )}

             {adminTab === 'LOGS' && (
               <div className="col-span-12 space-y-6 md:space-y-10 animate-in fade-in duration-500">
                 <div className={`rounded-[3rem] p-6 md:p-16 shadow-2xl border min-h-[600px] md:min-h-[800px] overflow-hidden transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 md:mb-16">
                      <h3 className={`text-2xl md:text-4xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-slate-900'}`}>Session Audit Trail</h3>
                      <button className={`px-6 md:px-8 py-2 md:py-3 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200'}`}>Export Telemetry</button>
                    </div>
                    
                    <div className="overflow-x-auto no-scrollbar">
                      <div className="min-w-[800px] space-y-4">
                        <div className="grid grid-cols-12 gap-6 px-10 mb-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                          <div className="col-span-2">Timestamp</div>
                          <div className="col-span-3">Principal</div>
                          <div className="col-span-3">Action Vector</div>
                          <div className="col-span-2 text-center">Status</div>
                          <div className="col-span-2 text-right">Node Hash</div>
                        </div>

                        <div className="space-y-4 max-h-[500px] md:max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                          {sessionLogs.map(log => (
                            <div key={log.id} className={`grid grid-cols-12 gap-6 px-10 py-6 md:py-8 border rounded-[2rem] items-center group transition-all ${darkMode ? 'bg-slate-800/30 border-slate-800 hover:bg-slate-800/60 hover:border-blue-500/30' : 'bg-slate-50/70 border-slate-100 hover:bg-white hover:border-blue-200'}`}>
                              <div className="col-span-2 font-mono text-[10px] md:text-xs text-slate-500 font-bold">{log.timestamp}</div>
                              <div className={`col-span-3 font-bold truncate ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{log.user}</div>
                              <div className="col-span-3">
                                <p className={`font-black text-xs md:text-sm uppercase tracking-tight ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{log.action}</p>
                                {log.details && <p className="text-[10px] text-slate-400 mt-1 italic font-light truncate">{log.details}</p>}
                              </div>
                              <div className="col-span-2 flex justify-center">
                                <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full ${
                                  log.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-500' : 
                                  log.status === 'FAILED' ? 'bg-red-500/10 text-red-500' : 
                                  log.status === 'WARNING' ? 'bg-amber-500/10 text-amber-500' : 
                                  'bg-blue-500/10 text-blue-500'
                                }`}>
                                  {log.status}
                                </span>
                              </div>
                              <div className="col-span-2 text-right font-mono text-[10px] text-slate-400 uppercase font-bold tracking-widest">#{(log.id || 'xxxx').toUpperCase()}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                 </div>
               </div>
             )}

             {adminTab === 'API_MONITOR' && (
               <div className="col-span-12 space-y-8 md:space-y-12 animate-in fade-in duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
                    <div className={`p-8 md:p-10 rounded-[2.5rem] shadow-xl border transition-all duration-500 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">AI Request Throughput</p>
                      <div className="flex items-end justify-between">
                        <span className={`text-4xl md:text-5xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{metricsSummary.total}</span>
                        <div className="bg-blue-500/10 p-3 rounded-2xl text-blue-500 shadow-lg shadow-blue-500/10">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                      </div>
                    </div>
                    <div className={`p-8 md:p-10 rounded-[2.5rem] shadow-xl border transition-all duration-500 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Gemini Latency (Avg)</p>
                      <div className="flex items-end justify-between">
                        <span className={`text-4xl md:text-5xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{metricsSummary.avgDuration}ms</span>
                        <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-500 shadow-lg shadow-emerald-500/10">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                      </div>
                    </div>
                    <div className={`p-8 md:p-10 rounded-[2.5rem] shadow-xl border transition-all duration-500 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Protocol Error Rate</p>
                      <div className="flex items-end justify-between">
                        <span className={`text-4xl md:text-5xl font-black ${metricsSummary.errorRate > 10 ? 'text-red-500' : (darkMode ? 'text-white' : 'text-slate-900')}`}>{metricsSummary.errorRate}%</span>
                        <div className={`p-3 rounded-2xl ${metricsSummary.errorRate > 10 ? 'bg-red-500/10 text-red-500 shadow-lg shadow-red-500/10' : 'bg-slate-500/10 text-slate-500'}`}>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-[3rem] p-6 md:p-16 shadow-2xl border min-h-[500px] transition-all duration-500 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                    <h3 className={`text-2xl md:text-3xl font-black mb-10 md:mb-16 tracking-tighter uppercase ${darkMode ? 'text-white' : 'text-slate-900'}`}>Live API Vector Stream</h3>
                    <div className="space-y-4">
                      {apiMetrics.length === 0 ? (
                        <div className="py-24 text-center opacity-20 italic font-light">Zero traffic in current buffer. Synchronizing...</div>
                      ) : (
                        apiMetrics.map(m => (
                          <div key={m.id} className={`p-6 md:p-8 border-2 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-4 group transition-all ${darkMode ? 'bg-slate-800/30 border-slate-800 hover:border-blue-500/50' : 'bg-slate-50/50 border-slate-100 hover:border-blue-500/20 hover:bg-white'}`}>
                            <div className="flex items-center gap-4 md:gap-8">
                              <div className={`w-3 h-3 rounded-full ${m.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-red-500'} shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse`}></div>
                              <div>
                                <p className={`font-black text-sm md:text-base tracking-tight ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{m.endpoint}</p>
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">TIMESTAMP: {new Date(m.timestamp).toLocaleTimeString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-6 md:gap-12">
                               <div className="text-right">
                                  <p className={`font-mono text-base font-black ${m.duration > 1000 ? 'text-amber-500' : (darkMode ? 'text-blue-400' : 'text-blue-600')}`}>{Math.round(m.duration)}ms</p>
                                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">LATENCY</p>
                               </div>
                               <div className="w-32 md:w-48 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                                  <div 
                                    className={`h-full transition-all duration-1000 ${m.status === 'SUCCESS' ? 'bg-blue-500' : 'bg-red-500'}`} 
                                    style={{ width: `${Math.min((m.duration / 2000) * 100, 100)}%` }} 
                                  />
                               </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
               </div>
             )}

             {adminTab === 'THREATS' && (
               <div className="col-span-12 space-y-6 md:space-y-10 animate-in fade-in duration-500">
                 <div className={`rounded-[3rem] p-6 md:p-16 shadow-2xl border min-h-[600px] md:min-h-[800px] transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 md:mb-16">
                      <h3 className={`text-2xl md:text-4xl font-black tracking-tighter uppercase ${darkMode ? 'text-white' : 'text-slate-900'}`}>Manual Adversary Reports</h3>
                      <div className="bg-red-600 text-white px-6 md:px-8 py-2 md:py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-red-500/20">{reportedBreaches.length} ADVISORIES</div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-10">
                      {reportedBreaches.length === 0 ? (
                        <div className="col-span-full py-40 text-center opacity-20 italic text-2xl font-light">
                          No adversarial indicators reported by nodes.
                        </div>
                      ) : (
                        reportedBreaches.map((rb, idx) => (
                          <div key={idx} className={`border-2 p-8 md:p-10 rounded-[2.5rem] space-y-6 animate-in slide-in-from-bottom-4 transition-all hover:-translate-y-2 hover:shadow-2xl ${darkMode ? 'bg-slate-800/30 border-slate-800 hover:border-red-500/30' : 'bg-slate-50/70 border-slate-100 hover:border-red-500/20 hover:bg-white'}`}>
                            <div className="flex justify-between items-start gap-2">
                              <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full ${rb.severity === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'}`}>
                                {rb.severity}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500 font-bold">{rb.date}</span>
                            </div>
                            <div className="space-y-2">
                              <h4 className={`text-2xl font-black tracking-tight leading-tight truncate uppercase ${darkMode ? 'text-white' : 'text-slate-900'}`}>{rb.source}</h4>
                              <p className={`leading-relaxed font-light text-sm italic ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>"{rb.description}"</p>
                            </div>
                            <div className={`pt-6 border-t ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                               <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Origin Node</p>
                               <p className={`font-bold text-sm truncate ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{rb.reporter}</p>
                            </div>
                            <button className={`w-full font-black py-5 rounded-2xl transition-all uppercase tracking-widest text-[10px] shadow-xl ${darkMode ? 'bg-slate-800 text-white hover:bg-blue-600' : 'bg-[#0F172A] text-white hover:bg-blue-600'}`}>Execute Forensics</button>
                          </div>
                        ))
                      )}
                    </div>
                 </div>
               </div>
             )}
          </div>
       </main>
    </div>
  );
};

export default AdminDashboard;
