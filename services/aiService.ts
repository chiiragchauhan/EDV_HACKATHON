
import { GoogleGenAI, Type } from "@google/genai";
import { ApiMetric, SessionEvent, BreachAlert } from "../types";

let metricCallback: ((metric: ApiMetric) => void) | null = null;

export function setMetricCallback(cb: (metric: ApiMetric) => void) {
  metricCallback = cb;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

async function recordMetric<T>(endpoint: string, action: () => Promise<T>): Promise<T> {
  const start = performance.now();
  try {
    const result = await action();
    const duration = performance.now() - start;
    metricCallback?.({
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      endpoint: `Gemini:${endpoint}`,
      duration,
      status: 'SUCCESS'
    });
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    metricCallback?.({
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      endpoint: `Gemini:${endpoint}`,
      duration,
      status: 'ERROR'
    });
    throw error;
  }
}

/**
 * Uses Gemini-3-flash to analyze trust signals in a cybersecurity context.
 */
export async function analyzeTrustSignals(activeSignals: string[], currentScore: number) {
  return recordMetric('analyzeTrustSignals', async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Context: A user's Zero-Trust score is ${currentScore}/100. 
      Active signals: ${activeSignals.length > 0 ? activeSignals.join(', ') : 'None'}.
      Action: Provide a single concise, technical, professional sentence for a cybersecurity dashboard describing the current trust state and potential mitigation steps.`,
      config: {
        systemInstruction: "You are an AI Security Analyst for ZTrust. Keep responses professional, authoritative, and under 25 words.",
      },
    });
    return response.text?.trim() || "System state verified. Monitoring for anomalies.";
  });
}

/**
 * Uses Gemini-3-pro to provide high-level SOC advice based on logs.
 */
export async function getSOCAdvice(logs: SessionEvent[], breaches: BreachAlert[]) {
  return recordMetric('getSOCAdvice', async () => {
    const logSummary = logs.slice(0, 10).map(l => `${l.timestamp}: ${l.action} (${l.status})`).join('\n');
    const breachSummary = breaches.slice(0, 5).map(b => `${b.source}: ${b.severity}`).join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze these recent SOC logs and breaches:
      LOGS:
      ${logSummary}
      
      BREACHES:
      ${breachSummary}
      
      Provide a high-level summary of the network security posture and one key recommendation.`,
      config: {
        systemInstruction: "You are a Senior Security Architect. Provide a strategic 2-sentence summary.",
      },
    });
    return response.text?.trim() || "Intelligence synchronized. POSTURE: STABLE.";
  });
}

/**
 * Checks for dark web exposure using simulated results enhanced by Gemini.
 */
export async function checkDarkWeb(email: string) {
  return recordMetric('checkDarkWeb', async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate 2 realistic cybersecurity breach records for the email ${email}. 
      Include source, date, severity (CRITICAL or MODERATE), and description.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              source: { type: Type.STRING },
              date: { type: Type.STRING },
              severity: { type: Type.STRING, enum: ['CRITICAL', 'MODERATE'] },
              description: { type: Type.STRING }
            },
            required: ["source", "date", "severity", "description"]
          }
        }
      }
    });
    
    try {
      return JSON.parse(response.text || '[]');
    } catch {
      return [];
    }
  });
}

/**
 * Analyzes password strength.
 */
export async function analyzePassword(password: string) {
  return recordMetric('analyzePassword', async () => {
    if (password.length < 8) return 'WEAK';
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the strength of this password (return only one word: WEAK, MEDIUM, or STRONG): ${password}`,
    });
    const strength = response.text?.toUpperCase().trim();
    if (strength === 'STRONG' || strength === 'MEDIUM' || strength === 'WEAK') return strength;
    return 'MEDIUM';
  });
}
