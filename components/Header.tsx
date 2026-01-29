
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-6 px-4 max-w-2xl mx-auto border-b border-slate-200 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <i className="fas fa-shield-halved text-white text-sm"></i>
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">VoxGuard</h1>
      </div>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">Forensic v1.0</span>
    </header>
  );
};

export default Header;
