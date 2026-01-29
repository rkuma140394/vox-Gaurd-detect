
import React from 'react';
import { AnalysisResult } from '../types';

interface Props {
  result: AnalysisResult;
  isLoading: boolean;
}

const AnalysisResultView: React.FC<Props> = ({ result, isLoading }) => {
  if (isLoading) {
    return (
      <div className="mt-8 p-10 bg-slate-900 border border-slate-700 rounded-3xl text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/20">
          <div className="h-full bg-indigo-500 animate-[loading_2s_infinite]"></div>
        </div>
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-white font-bold tracking-tight mb-2">Deep Spectral Forensic Analysis</p>
        <p className="text-slate-400 text-xs font-mono animate-pulse">Running Pro-Reasoning (Thinking Mode Enabled)...</p>
      </div>
    );
  }

  if (result.status === 'error' as any) {
    return (
      <div className="mt-8 p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm font-medium">
        <i className="fas fa-exclamation-circle mr-2"></i>
        Analysis Failed: {result.explanation}
      </div>
    );
  }

  const isAI = result.classification === 'AI_GENERATED';
  const confidencePercent = Math.round(result.confidenceScore * 100);

  return (
    <div className="mt-8 animate-in fade-in zoom-in-95 duration-500">
      <div className={`p-8 rounded-3xl border-2 shadow-2xl bg-white relative overflow-hidden ${isAI ? 'border-rose-100' : 'border-emerald-100'}`}>
        
        {/* High Precision Badge */}
        <div className="absolute top-4 right-4 flex items-center space-x-1.5 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
           <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
           <span className="text-[9px] font-black text-indigo-600 uppercase tracking-tighter">High-Precision Mode</span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Final Verdict</p>
            <h3 className={`text-4xl font-black tracking-tight ${isAI ? 'text-rose-600' : 'text-emerald-600'}`}>
              {result.classification.replace('_', ' ')}
            </h3>
          </div>
          
          <div className="w-full md:w-auto">
             <div className="flex justify-between items-end mb-1">
                <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Confidence</p>
                <span className="text-sm font-black text-slate-900">{confidencePercent}%</span>
             </div>
             <div className="w-full md:w-48 h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ease-out ${isAI ? 'bg-rose-500' : 'bg-emerald-500'}`}
                  style={{ width: `${confidencePercent}%` }}
                ></div>
             </div>
          </div>
        </div>
        
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 relative">
          <i className="fas fa-quote-left absolute top-4 left-4 text-slate-200 text-2xl"></i>
          <p className="text-slate-700 text-sm leading-relaxed font-semibold pl-6 relative z-10 italic">
            {result.explanation}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-50 pt-6">
            <span className="flex items-center"><i className="fas fa-language mr-2 text-indigo-400"></i> {result.language} Engine</span>
            <span className="flex items-center"><i className="fas fa-microchip mr-2 text-indigo-400"></i> Gemini 3 Pro Forensic</span>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResultView;
