
export enum AppState {
  LOGIN = 'LOGIN',
  LOADING = 'LOADING',
  TWO_FACTOR = 'TWO_FACTOR',
  USER_DASHBOARD = 'USER_DASHBOARD',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  RESTRICTED = 'RESTRICTED'
}

export interface User {
  email: string;
  role: 'ADMIN' | 'USER';
}

export interface ContextSignal {
  id: string;
  name: string;
  category: string;
  active: boolean;
  icon: string;
  impact: number;
}

export interface JournalEntry {
  id: string;
  impact: 'LOW' | 'HIGH';
  timestamp: string;
  message: string;
  strength: number;
}

export interface PasswordRecord {
  id: string;
  site: string;
  username: string;
  passwordString: string;
  strength: 'WEAK' | 'MEDIUM' | 'STRONG';
}

export interface BreachAlert {
  id: string;
  source: string;
  date: string;
  severity: 'CRITICAL' | 'MODERATE';
  description: string;
}

export interface SessionEvent {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  status: 'SUCCESS' | 'FAILED' | 'INFO' | 'WARNING';
  details?: string;
}

export interface ApiMetric {
  id: string;
  timestamp: number;
  endpoint: string;
  duration: number;
  status: 'SUCCESS' | 'ERROR';
}
