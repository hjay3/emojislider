import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ScientificSlider } from './components/ScientificSlider';
import { MorphDisplay } from './components/MorphDisplay';
import { DataLog } from './components/DataLog';
import { fetchNextValue } from './services/geminiService';
import { LogEntry, GeminiResponse } from './types';
import { MIN_POLL_INTERVAL, MAX_POLL_INTERVAL } from './constants';
import { Activity, Lock, Unlock } from 'lucide-react';

const App: React.FC = () => {
  const [value, setValue] = useState<number>(1);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isAutoMode, setIsAutoMode] = useState<boolean>(true);
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Helper to add logs
  const addLog = useCallback((source: 'SYSTEM' | 'USER' | 'GEMINI', message: string, data?: any) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const ms = now.getMilliseconds().toString().padStart(3, '0');

    const newLog: LogEntry = {
      id: Math.random().toString(36).substring(7),
      timestamp: `${timeStr}.${ms}`,
      source,
      message,
      data
    };
    setLogs(prev => [...prev, newLog]);
  }, []);

  // Poll Gemini
  const pollGemini = useCallback(async () => {
    if (!isAutoMode) return;

    addLog('SYSTEM', 'Initiating uplink to Gemini 2.5 Flash...');
    
    try {
      const startTime = performance.now();
      const data: GeminiResponse = await fetchNextValue();
      const duration = (performance.now() - startTime).toFixed(1);
      
      setValue(data.value);
      addLog('GEMINI', `Received update in ${duration}ms.`, data);
    } catch (err) {
      addLog('SYSTEM', 'Uplink failure.', err);
    }

    // Schedule next poll
    const delay = Math.floor(Math.random() * (MAX_POLL_INTERVAL - MIN_POLL_INTERVAL + 1)) + MIN_POLL_INTERVAL;
    addLog('SYSTEM', `Next poll scheduled in ${(delay / 1000).toFixed(1)}s`);
    
    timeoutId.current = setTimeout(pollGemini, delay);
  }, [isAutoMode, addLog]);

  // Handle Mode Toggle
  useEffect(() => {
    if (isAutoMode) {
      pollGemini();
    } else {
      if (timeoutId.current) clearTimeout(timeoutId.current);
      addLog('SYSTEM', 'Autonomous Control Override: Manual Mode Engaged.');
    }

    return () => {
      if (timeoutId.current) clearTimeout(timeoutId.current);
    };
  }, [isAutoMode, pollGemini, addLog]);

  // Initial Welcome Log
  useEffect(() => {
    addLog('SYSTEM', 'System Initialized. Morph Engine Online.');
  }, [addLog]);

  return (
    <div className="min-h-screen bg-sci-bg text-gray-200 font-sans selection:bg-sci-accent/30 selection:text-white flex flex-col items-center py-12 px-4 relative overflow-y-auto">
      
      {/* Background Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none" 
           style={{
             backgroundImage: 'radial-gradient(circle at center, #111 0%, #000 100%), linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)',
             backgroundSize: '100% 100%, 40px 40px, 40px 40px',
             backgroundBlendMode: 'screen'
           }}>
      </div>
      
      {/* Ambient Glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sci-accent/5 rounded-full blur-[100px] pointer-events-none animate-pulse-fast"></div>

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-4xl flex flex-col gap-8 mb-20">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-end justify-between border-b border-sci-dim pb-4 gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter text-white flex items-center gap-3">
              <Activity className="text-sci-accent w-8 h-8" />
              MORPH LAB <span className="text-xs align-top text-sci-accent bg-sci-accent/10 px-1 py-0.5 rounded border border-sci-accent/20">V2.0</span>
            </h1>
            <p className="text-sm font-mono text-gray-500 mt-1">GEMINI-2.5-FLASH // REAL-TIME INTERPOLATION ENGINE</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsAutoMode(!isAutoMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded border text-xs font-mono transition-all ${isAutoMode ? 'bg-sci-accent/10 border-sci-accent text-sci-accent' : 'bg-transparent border-sci-dim text-gray-500 hover:border-gray-400'}`}
            >
              {isAutoMode ? <Lock size={14} /> : <Unlock size={14} />}
              {isAutoMode ? 'AUTONOMOUS' : 'MANUAL OVERRIDE'}
            </button>
            <div className="flex items-center gap-2 text-xs font-mono text-sci-accent">
              <div className={`w-2 h-2 rounded-full ${isAutoMode ? 'bg-sci-accent animate-ping' : 'bg-gray-600'}`}></div>
              {isAutoMode ? 'LIVE' : 'OFFLINE'}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="bg-sci-panel/80 backdrop-blur-xl border border-sci-dim rounded-2xl p-6 md:p-10 shadow-2xl relative overflow-visible">
          {/* Decorative Top Line */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-sci-accent/50 to-transparent"></div>

          <div className="flex flex-col items-center">
            <MorphDisplay value={value} />
            
            <div className="w-full mt-12 mb-6">
              <div className="flex justify-between items-end mb-4 font-mono text-xs text-sci-accent/70 px-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500">PARAMETER_CONTROL</span>
                    <span className="text-xl text-white font-bold tracking-widest">INTENSITY</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-gray-500">CURRENT_VALUE</span>
                    <span className="text-2xl text-sci-accent font-bold">{value.toFixed(2)}</span>
                  </div>
              </div>
              
              <ScientificSlider 
                value={value} 
                min={1} 
                max={10} 
                step={0.01} 
                onChange={(val) => {
                  setValue(val);
                  if (isAutoMode) {
                    setIsAutoMode(false); // Disengage auto on manual interaction
                    addLog('USER', 'Manual adjustment detected. Auto-mode disengaged.');
                  }
                }} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-sci-dim/50 font-mono text-[10px] text-gray-500">
             <div>
                <span className="block text-gray-400 mb-1">LATENCY</span>
                <span className="text-sci-accent">24ms</span>
             </div>
             <div>
                <span className="block text-gray-400 mb-1">INTERPOLATION</span>
                <span className="text-sci-accent">BICUBIC</span>
             </div>
             <div>
                <span className="block text-gray-400 mb-1">RENDER_ENGINE</span>
                <span className="text-sci-accent">WEBGL_SIM</span>
             </div>
             <div className="text-right">
                <span className="block text-gray-400 mb-1">SOURCE</span>
                <span className="text-sci-accent">{isAutoMode ? 'GEMINI_API' : 'LOCAL_INPUT'}</span>
             </div>
          </div>

        </div>
      </main>

      {/* Floating Log Container */}
      <DataLog logs={logs} />
    </div>
  );
};

export default App;