import React, { useState, useEffect, useRef, useCallback } from 'react';
import CameraView from './components/CameraView';
import ResultCard from './components/ResultCard';
import HelpModal from './components/HelpModal';
import { solveProblemFromImage } from './services/geminiService';
import { ScanResult, CameraHandle } from './types';

const AUTO_SCAN_INTERVAL_MS = 30000; // 30 seconds

export default function App() {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [timeUntilNextScan, setTimeUntilNextScan] = useState<number>(AUTO_SCAN_INTERVAL_MS);
  const cameraRef = useRef<CameraHandle>(null);
  const intervalRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const isProcessingRef = useRef<boolean>(false);

  const performScan = useCallback(async () => {
    if (!cameraRef.current) return;

    // Prevent overlapping scans
    if (isProcessingRef.current) {
      console.log("Skipping scan: Previous analysis is still in progress.");
      return;
    }

    const imageBase64 = cameraRef.current.capture();
    if (!imageBase64) return;

    isProcessingRef.current = true; // Lock

    const newId = Date.now().toString();
    const newResult: ScanResult = {
      id: newId,
      timestamp: Date.now(),
      imageUrl: imageBase64,
      text: '',
      reasoning: '',
      sources: [],
      loading: true
    };

    setResults(prev => [newResult, ...prev]);
    setTimeUntilNextScan(AUTO_SCAN_INTERVAL_MS);

    try {
      const { text, reasoning, sources } = await solveProblemFromImage(imageBase64);

      setResults(prev => prev.map(r =>
        r.id === newId
          ? { ...r, loading: false, text, reasoning, sources }
          : r
      ));
    } catch (error: any) {
      setResults(prev => prev.map(r =>
        r.id === newId
          ? { ...r, loading: false, error: error.message || "분석 실패" }
          : r
      ));
    } finally {
      isProcessingRef.current = false; // Unlock
    }
  }, []);

  // Timer logic
  useEffect(() => {
    if (isActive) {
      timerRef.current = window.setInterval(() => {
        setTimeUntilNextScan(prev => {
          const next = prev - 1000;
          if (next <= 0) return AUTO_SCAN_INTERVAL_MS;
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setTimeUntilNextScan(AUTO_SCAN_INTERVAL_MS);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  // Auto-scan logic
  useEffect(() => {
    if (isActive) {
      intervalRef.current = window.setInterval(() => {
        performScan();
      }, AUTO_SCAN_INTERVAL_MS);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, performScan]);

  const handleToggle = () => {
    const newState = !isActive;
    setIsActive(newState);
    if (newState) {
      // Start countdown without immediate scan
      setTimeUntilNextScan(AUTO_SCAN_INTERVAL_MS);
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex justify-between items-center transition-all duration-300">
        <h1 className="text-xl font-bold tracking-tighter">
          MEGASOLVER
        </h1>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsHelpOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          <button
            onClick={handleToggle}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${isActive ? 'bg-white' : 'bg-neutral-800'
              }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full transition-transform duration-300 shadow-sm ${isActive ? 'translate-x-7 bg-black' : 'translate-x-1 bg-neutral-500'
                }`}
            />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-6 flex flex-col gap-8 pb-32">
        {/* Status Bar */}
        <div className="flex justify-between items-center text-xs font-medium tracking-wide uppercase text-neutral-500">
          <span className={`${isActive ? 'text-green-400' : 'text-neutral-500'}`}>
            {isActive ? "● Active" : "○ Idle"}
          </span>
          {isActive && (
            <span className="font-mono text-neutral-400">
              Next Scan: {formatTime(timeUntilNextScan)}
            </span>
          )}
        </div>

        {/* Camera Section */}
        <div className="relative group w-64 mx-auto">
          {/* Camera View */}
          <div className={`relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900 shadow-2xl transition-all duration-500 ${isActive ? 'ring-1 ring-white/20' : 'opacity-50 grayscale'}`}>
            <CameraView ref={cameraRef} isActive={isActive} />
          </div>
        </div>

        {/* Results Section */}
        <div className="flex flex-col gap-6">
          {results.length > 0 ? (
            <>
              <div className="animate-fade-in-up">
                <ResultCard result={results[0]} isLatest={true} />
              </div>

              {/* History */}
              {results.length > 1 && (
                <div className="pt-8 border-t border-white/5 space-y-6 opacity-60 hover:opacity-100 transition-opacity">
                  <h3 className="text-xs font-bold text-neutral-600 uppercase tracking-widest px-1">
                    History
                  </h3>
                  {results.slice(1).map(result => (
                    <ResultCard key={result.id} result={result} isLatest={false} />
                  ))}
                </div>
              )}
            </>
          ) : (
            isActive && (
              <div className="text-center py-12 text-neutral-600 animate-pulse">
                <p className="text-sm font-medium">Waiting for content...</p>
              </div>
            )
          )}
        </div>
      </main>

      {/* Bottom Fixed Full-Width Scan Button */}
      {isActive && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-black to-transparent pt-10">
          <button
            onClick={performScan}
            className="w-full h-16 bg-white text-black rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center justify-center gap-3 active:scale-95 transition-all duration-200 hover:bg-neutral-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-lg font-black tracking-widest uppercase">Scan Now</span>
          </button>
        </div>
      )}

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}