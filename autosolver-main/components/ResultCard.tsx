import React, { useState } from 'react';
import { ScanResult } from '../types';

interface ResultCardProps {
  result: ScanResult;
  isLatest?: boolean;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, isLatest = false }) => {
  const [showReasoning, setShowReasoning] = useState(false);

  // Helper to determine color based on the answer text
  const getAnswerStyle = (text: string) => {
    const cleanText = text.trim().toUpperCase();

    // Priority 1: Check for Error / Unknown first
    if (cleanText === 'UNKNOWN') {
      return 'bg-neutral-800 text-neutral-500 border-neutral-700';
    }
    // Check for "Error" explicitly (or starts with Error if needed, but exact match or includes is safer)
    if (cleanText === 'ERROR' || cleanText === '분석 실패' || cleanText.includes('ERROR')) {
      return 'bg-neutral-800 text-neutral-500 border-neutral-700';
    }

    // Specific Colors for A, B, C, D / 1, 2, 3, 4
    if (cleanText.startsWith('A') || cleanText === '1') {
      return 'bg-red-600/90 text-white border-red-500 shadow-red-900/20';
    }
    if (cleanText.startsWith('B') || cleanText === '2') {
      return 'bg-blue-600/90 text-white border-blue-500 shadow-blue-900/20';
    }
    if (cleanText.startsWith('C') || cleanText === '3') {
      return 'bg-green-600/90 text-white border-green-500 shadow-green-900/20';
    }
    if (cleanText.startsWith('D') || cleanText === '4') {
      return 'bg-amber-500/90 text-black border-amber-400 shadow-amber-900/20';
    }
    if (cleanText.startsWith('E') || cleanText === '5') {
      return 'bg-purple-600/90 text-white border-purple-500 shadow-purple-900/20';
    }

    // Default style
    return 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-900/20';
  };

  const answerStyle = getAnswerStyle(result.text || "");

  return (
    <div className={`rounded-3xl overflow-hidden animate-fade-in transition-all duration-500 border border-white/5 ${isLatest ? 'shadow-2xl shadow-black/50 scale-100' : 'opacity-60 scale-95 hover:opacity-100 hover:scale-100'}`}>

      {/* Header: Time & Status */}
      <div className="bg-neutral-900 px-5 py-3 flex justify-between items-center border-b border-white/5">
        <span className="text-xs font-mono text-neutral-500">
          {new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
        {result.loading && (
          <span className="flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold bg-neutral-800 text-neutral-300 border border-white/5">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></span> Analyze
          </span>
        )}
        {result.error && (
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-red-900/20 text-red-500 border border-red-900/30">Error</span>
        )}
      </div>

      <div className="flex flex-col bg-neutral-900">

        {/* Massive Answer Display */}
        <div className={`
            relative min-h-[180px] flex items-center justify-center p-8 text-center transition-colors duration-500
            ${result.loading ? 'bg-neutral-900' : answerStyle}
        `}>
          {result.loading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              <p className="text-neutral-500 text-xs font-medium tracking-widest animate-pulse uppercase">Processing...</p>
            </div>
          ) : (
            <div className="animate-scale-in">
              <h2 className={`font-black tracking-tighter drop-shadow-md ${(result.text?.length || 0) > 3 ? 'text-3xl leading-tight break-all' : 'text-8xl'
                }`}>
                {result.text || "?"}
              </h2>
            </div>
          )}
        </div>

        {/* Reasoning Toggle Section */}
        <div className="p-1">
          {!result.loading && !result.error && result.reasoning && (
            <div className="bg-neutral-900 p-4">
              <button
                onClick={() => setShowReasoning(!showReasoning)}
                className="w-full group flex items-center justify-center gap-3 py-3 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 transition-all active:scale-98"
              >
                <span className="text-sm font-medium text-neutral-400 group-hover:text-white transition-colors">
                  {showReasoning ? 'Hide Explanation' : 'View Explanation'}
                </span>
                <span className={`text-neutral-500 transition-transform duration-300 ${showReasoning ? 'rotate-180' : ''}`}>
                  ↓
                </span>
              </button>

              {showReasoning && (
                <div className="mt-4 p-5 rounded-2xl bg-black border border-white/10 text-sm text-neutral-300 leading-relaxed break-words whitespace-pre-wrap animate-fade-in shadow-inner">
                  <div className="flex gap-2 mb-3 text-neutral-500 text-xs uppercase tracking-widest font-bold">
                    <span>Reasoning</span>
                  </div>
                  {result.reasoning}
                </div>
              )}
            </div>
          )}

          {/* Footer: Sources */}
          {!result.loading && !result.error && result.sources && result.sources.length > 0 && (
            <div className="px-5 pb-5 flex flex-wrap gap-2">
              {result.sources.map((source, idx) => (
                <a
                  key={idx}
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[10px] font-medium text-neutral-500 bg-neutral-800 hover:bg-neutral-700 hover:text-neutral-300 px-3 py-1.5 rounded-full transition-colors max-w-[100%] truncate border border-white/5"
                >
                  <span className="opacity-50">↗</span> {source.title || "Source"}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultCard;