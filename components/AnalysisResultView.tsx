
import React from 'react';
import { AnalysisResult } from '../types';

interface Props {
  result: AnalysisResult;
  isLoading: boolean;
}

const AnalysisResultView: React.FC<Props> = ({ result, isLoading }) => {
  if (isLoading) {
    return (
      <div className="mt-8 p-10 bg-white border border-slate-200 rounded-2xl text-center shadow-sm">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 font-medium tracking-tight">Running Hackathon-Compliant Analysis...</p>
      </div>
    );
  }

  if (result.status === 'error' as any) {
    return (
      <div className="mt-8 p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm font-medium">
        <i className="fas fa-exclamation-circle mr-2"></i>
        Error: {result.explanation}
      </div>
    );
  }

  const isAI = result.classification === 'AI_GENERATED';

  return (
    <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className={`p-8 rounded-2xl border-2 shadow-xl shadow-slate-200/50 bg-white ${isAI ? 'border-rose-100' : 'border-emerald-100'}`}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Status: {result.status}</p>
            <h3 className={`text-3xl font-black ${isAI ? 'text-rose-600' : 'text-emerald-600'}`}>
              {result.classification}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Score (0-1)</p>
            <p className="text-3xl font-black text-slate-900">{result.confidenceScore.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="bg-slate-50 p-4 rounded-xl">
          <p className="text-slate-700 text-sm leading-relaxed font-medium italic">
            "{result.explanation}"
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Detected Language: {result.language}</span>
            <span>API Version: v1.1</span>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResultView;
