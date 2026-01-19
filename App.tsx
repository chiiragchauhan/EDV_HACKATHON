
import React, { useState, useEffect, useCallback } from 'react';
import { AppState, User, ContextSignal, JournalEntry, SessionEvent, BreachAlert, ApiMetric } from './types';
import Login from './components/Login';
import Loading from './components/Loading';
import TwoFactor from './components/TwoFactor';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import Restricted from './components/Restricted';
import { setMetricCallback } from './services/aiService';

const INITIAL_SIGNALS: ContextSignal[] = [
  { id: 'wifi', name: 'Public WiFi', category: 'NETWORK HEALTH', active: false, icon: 'wifi', impact: 35 },
  { id: 'geo', name: 'Unusual Geo', category: 'GEOFENCING', active: false, icon: 'globe', impact: 45 },
  { id: 'bot', name: 'Bot Pattern', category: 'USER BEHAVIOR', active: false, icon: 'zap', impact: 60 },
];

const App: React.FC = () => {
  const [view, setView] = useState<AppState>(AppState.LOGIN);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [signals, setSignals] = useState<ContextSignal[]>(INITIAL_SIGNALS);
  const [trustScore, setTrustScore] = useState(25);
  const [restrictedUsers, setRestrictedUsers] = useState<string[]>([]);
  const [sessionLogs, setSessionLogs] = useState<SessionEvent[]>([]);
  const [reportedBreaches, setReportedBreaches] = useState<(BreachAlert & { reporter: string })[]>([]);
  const [apiMetrics, setApiMetrics] = useState<ApiMetric[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [journal, setJournal] = useState<JournalEntry[]>([
    {
      id: '1',
      impact: 'LOW',
      timestamp: new Date().toLocaleTimeString(),
      message: '"Your session is secured by continuous identity verification and standard behavioral monitoring."',
      strength: 25
    }
  ]);

  useEffect(() => {
    setMetricCallback((metric) => {
      setApiMetrics(prev => [metric, ...prev].slice(0, 100));
    });
  }, []);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const addLog = useCallback((action: string, status: SessionEvent['status'], details?: string) => {
    const newLog: SessionEvent = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      user: currentUser?.email || 'System',
      action,
      status,
      details
    };
    setSessionLogs(prev => [newLog, ...prev]);
  }, [currentUser]);

  const handleLogin = (email: string) => {
    addLog('Authentication Attempt', 'INFO', `Email: ${email}`);
    if (restrictedUsers.includes(email)) {
      addLog('Access Denied', 'FAILED', 'Account is currently isolated');
      setCurrentUser({ email, role: 'USER' });
      setView(AppState.RESTRICTED);
      return;
    }
    const role = email.includes('admin') ? 'ADMIN' : 'USER';
    setCurrentUser({ email, role });
    setView(AppState.LOADING);
    
    setTimeout(() => {
      setView(AppState.TWO_FACTOR);
    }, 2000);
  };

  const handleVerify = () => {
    addLog('2FA Verification', 'SUCCESS', 'Multi-factor challenge completed');
    setView(AppState.LOADING);
    setTimeout(() => {
      if (currentUser?.role === 'ADMIN') {
        addLog('Admin Panel Accessed', 'INFO');
        setView(AppState.ADMIN_DASHBOARD);
      } else {
        addLog('User Session Initialized', 'SUCCESS');
        setView(AppState.USER_DASHBOARD);
      }
    }, 1500);
  };

  const toggleSignal = (id: string) => {
    const signal = signals.find(s => s.id === id);
    addLog('Signal Adjusted', 'INFO', `${signal?.name} -> ${!signal?.active ? 'ON' : 'OFF'}`);
    setSignals(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const logout = () => {
    addLog('Session Terminated', 'INFO', 'Manual logout performed');
    setView(AppState.LOGIN);
    setCurrentUser(null);
    setSignals(INITIAL_SIGNALS);
    setTrustScore(25);
  };

  const handleBreachDetected = (email: string) => {
    addLog('Isolation Triggered', 'WARNING', `Automatic isolation for ${email} due to high risk score`);
    setRestrictedUsers(prev => [...new Set([...prev, email])]);
    setView(AppState.RESTRICTED);
  };

  const revokeRestriction = (email: string) => {
    addLog('Isolation Revoked', 'SUCCESS', `Admin manual revocation for ${email}`);
    setRestrictedUsers(prev => prev.filter(e => e !== email));
  };

  const handleReportBreach = (breach: BreachAlert) => {
    addLog('Threat Reported', 'WARNING', `User ${currentUser?.email} reported breach: ${breach.source}`);
    setReportedBreaches(prev => [...prev, { ...breach, reporter: currentUser?.email || 'Unknown' }]);
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      <div className={`${darkMode ? 'text-slate-100' : 'text-slate-900'} selection:bg-blue-500/20`}>
        {view === AppState.LOGIN && <Login onLogin={handleLogin} darkMode={darkMode} onToggleTheme={toggleTheme} />}
        {view === AppState.LOADING && <Loading darkMode={darkMode} />}
        {view === AppState.TWO_FACTOR && <TwoFactor onVerify={handleVerify} email={currentUser?.email || ''} darkMode={darkMode} />}
        {view === AppState.USER_DASHBOARD && (
          <UserDashboard 
            user={currentUser!} 
            signals={signals} 
            toggleSignal={toggleSignal} 
            trustScore={trustScore}
            journal={journal}
            onLogout={logout}
            setJournal={setJournal}
            setTrustScore={setTrustScore}
            onBreachDetected={() => handleBreachDetected(currentUser!.email)}
            addLog={addLog}
            onReportBreach={handleReportBreach}
            darkMode={darkMode}
            onToggleTheme={toggleTheme}
          />
        )}
        {view === AppState.ADMIN_DASHBOARD && (
          <AdminDashboard 
            user={currentUser!} 
            onLogout={logout} 
            restrictedUsers={restrictedUsers}
            onRevoke={revokeRestriction}
            sessionLogs={sessionLogs}
            reportedBreaches={reportedBreaches}
            apiMetrics={apiMetrics}
            darkMode={darkMode}
            onToggleTheme={toggleTheme}
          />
        )}
        {view === AppState.RESTRICTED && (
          <Restricted darkMode={darkMode} onAcknowledge={() => {
            if (!restrictedUsers.includes(currentUser?.email || '')) {
              addLog('Restriction Acknowledged', 'INFO', 'User re-entering dashboard');
              setView(AppState.USER_DASHBOARD);
            } else {
              addLog('Isolation Finalized', 'INFO', 'User redirected to login');
              logout();
            }
          }} />
        )}
      </div>
    </div>
  );
};

export default App;
