
import React, { useState, useEffect, useRef } from 'react';

interface Props {
  onVerify: () => void;
  email: string;
  darkMode?: boolean;
}

const TwoFactor: React.FC<Props> = ({ onVerify, email, darkMode }) => {
  const [code, setCode] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('891794');
  const [step, setStep] = useState<'CODE' | 'BIOMETRIC'>('CODE');
  const [bioStatus, setBioStatus] = useState<'WAITING' | 'SCANNING' | 'SUCCESS'>('WAITING');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleStartBiometric = async () => {
    setStep('BIOMETRIC');
    setBioStatus('SCANNING');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setTimeout(() => {
        setBioStatus('SUCCESS');
        setTimeout(() => {
          stream.getTracks().forEach(track => track.stop());
          onVerify();
        }, 1500);
      }, 3000);
    } catch (err) {
      console.error("Camera access denied", err);
      setBioStatus('WAITING');
      setStep('CODE');
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-500 relative overflow-hidden ${darkMode ? 'bg-slate-950' : 'bg-[#F1F5F9]'}`}>
      <div className={`fixed top-4 transition-all duration-500 transform ${showNotification ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'} z-50 w-full max-w-lg px-4`}>
        <div className="bg-[#1C1C1E] text-white rounded-2xl p-4 shadow-2xl flex items-center gap-4 border border-white/10">
          <div className="bg-white p-2 rounded-xl">
             <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" className="w-8 h-8" alt="Gmail" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center text-[10px] opacity-60">
              <span className="font-bold tracking-tight">ZTrust Security Protocol • now</span>
            </div>
            <p className="font-bold text-sm">Action Required: MFA Challenge</p>
            <p className="text-xs opacity-80">Use code <span className="text-blue-400 font-mono font-bold text-sm">{verificationCode}</span> or perform AI Biometric Face Scan.</p>
          </div>
          <button onClick={() => setShowNotification(false)} className="opacity-40 hover:opacity-100 p-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
      </div>

      <div className={`${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white shadow-2xl'} rounded-[3rem] w-full max-w-md p-10 py-12 text-center space-y-8 relative z-10 transition-all duration-500`}>
        {step === 'CODE' ? (
          <>
            <div className={`${darkMode ? 'bg-slate-800' : 'bg-slate-50'} w-20 h-20 rounded-full flex items-center justify-center mx-auto ring-4 ring-blue-500/10`}>
              <svg className={`w-10 h-10 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>

            <div className="space-y-3">
              <h2 className={`text-3xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>Verify Access</h2>
              <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} text-xs max-w-[280px] mx-auto leading-relaxed`}>
                Identify yourself using the dynamic verification token or initiate biometric evaluation.
              </p>
            </div>

            <div className="relative group">
              <input 
                type="text" 
                maxLength={6}
                placeholder="TOKEN"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className={`w-full border-2 rounded-2xl p-6 text-center text-3xl font-black font-mono tracking-[0.4em] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-200/50 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-100'}`}
              />
            </div>

            <div className="space-y-4 pt-2">
              <button 
                disabled={code.length !== 6}
                onClick={onVerify}
                className={`w-full disabled:opacity-30 font-black p-5 rounded-2xl uppercase tracking-widest transition-all shadow-xl ${darkMode ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                Submit Code
              </button>
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">OR</span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
              </div>
              <button 
                onClick={handleStartBiometric}
                className={`w-full font-black p-5 rounded-2xl uppercase tracking-widest transition-all border-2 flex items-center justify-center gap-3 ${darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-100 text-slate-600 hover:bg-slate-50'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                AI Biometric Scan
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <h2 className={`text-2xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>Biometric Verification</h2>
            <div className="relative w-64 h-64 mx-auto rounded-full overflow-hidden border-4 border-blue-500 shadow-2xl ring-8 ring-blue-500/10">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
              {bioStatus === 'SCANNING' && (
                <div className="absolute inset-0 bg-blue-500/10 pointer-events-none overflow-hidden">
                  <div className="h-1 w-full bg-blue-500 absolute top-0 animate-[scan_2s_linear_infinite] shadow-[0_0_15px_rgba(59,130,246,1)]"></div>
                </div>
              )}
              {bioStatus === 'SUCCESS' && (
                <div className="absolute inset-0 bg-emerald-500/80 flex items-center justify-center animate-in fade-in duration-300">
                  <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                </div>
              )}
            </div>
            <p className={`text-sm font-black uppercase tracking-[0.2em] ${bioStatus === 'SCANNING' ? 'text-blue-500 animate-pulse' : 'text-emerald-500'}`}>
              {bioStatus === 'SCANNING' ? 'AI Analyzing Facial Vectors...' : 'Identity Verified'}
            </p>
            <button 
              onClick={() => { setStep('CODE'); if (videoRef.current?.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop()); }}
              className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors"
            >
              Cancel Scan
            </button>
          </div>
        )}

        <div className="flex justify-between items-center text-[11px] font-black tracking-wider pt-4">
          <button className="text-blue-600 hover:text-blue-700 uppercase">Recovery Options</button>
          <span className="text-slate-400 uppercase">Session Expiry: 09:59</span>
        </div>
      </div>
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(6400%); }
        }
      `}</style>
    </div>
  );
};

export default TwoFactor;
