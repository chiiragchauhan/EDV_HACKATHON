
import { ApiMetric } from "../types";

let metricCallback: ((metric: ApiMetric) => void) | null = null;

export function setMetricCallback(cb: (metric: ApiMetric) => void) {
  metricCallback = cb;
}

/**
 * Simulates a network delay and records metrics to keep the Admin UI alive.
 */
async function recordMetric<T>(endpoint: string, action: () => Promise<T>): Promise<T> {
  const start = performance.now();
  // Simulate a realistic network latency (300ms - 800ms)
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
  
  try {
    const result = await action();
    const duration = performance.now() - start;
    metricCallback?.({
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      endpoint: `LocalAuth:${endpoint}`,
      duration,
      status: 'SUCCESS'
    });
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    metricCallback?.({
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      endpoint: `LocalAuth:${endpoint}`,
      duration,
      status: 'ERROR'
    });
    throw error;
  }
}

/**
 * Locally analyzes cybersecurity trust signals to provide status updates.
 */
export async function analyzeTrustSignals(activeSignals: string[]) {
  return recordMetric('analyzeTrustSignals', async () => {
    if (activeSignals.length === 0) {
      return "Your session is secured by standard monitoring and continuous identity verification.";
    }

    const messages = [
      `Caution: Detected ${activeSignals.join(' and ')}. Trust level is degrading due to environmental risks.`,
      `Security Alert: ${activeSignals[0]} signal identified. Implementing enhanced packet inspection.`,
      `Protocol update: Mitigating risks associated with ${activeSignals.join(', ')}.`,
      `Anomalous behavior detected via ${activeSignals[activeSignals.length - 1]}. Monitoring for lateral movement.`,
      `Zero-Trust policy applied to ${activeSignals.join(' context')}. Re-authentication may be required.`
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  });
}

/**
 * Locally simulates a dark web scan with realistic randomized data.
 */
export async function checkDarkWeb(email: string) {
  return recordMetric('checkDarkWeb', async () => {
    const sources = ["Pastebin Leak", "ShadowForum", "Genesis Market", "Collection #5", "RedLine Stealer Logs", "LulzSec Archive"];
    const severities: ("CRITICAL" | "MODERATE")[] = ["CRITICAL", "MODERATE"];
    
    // Generate 2 random breach objects
    return [
      {
        id: Math.random().toString(36).substr(2, 9),
        source: sources[Math.floor(Math.random() * sources.length)],
        date: new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString(),
        severity: severities[Math.floor(Math.random() * severities.length)],
        description: `Credentials associated with ${email.split('@')[0]} found in a clear-text dump.`
      },
      {
        id: Math.random().toString(36).substr(2, 9),
        source: sources[Math.floor(Math.random() * sources.length)],
        date: new Date(Date.now() - Math.random() * 5000000000).toLocaleDateString(),
        severity: severities[Math.floor(Math.random() * severities.length)],
        description: `Multi-factor bypass token for ${email} listed on underground marketplace.`
      }
    ];
  });
}

/**
 * Locally analyzes password strength using entropy-based logic.
 */
export async function analyzePassword(password: string) {
  return recordMetric('analyzePassword', async () => {
    if (password.length < 6) return 'WEAK';
    
    let score = 0;
    if (password.length > 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (password.length > 14) score++;

    if (score >= 4) return 'STRONG';
    if (score >= 2) return 'MEDIUM';
    return 'WEAK';
  });
}
