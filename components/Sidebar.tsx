
import React from 'react';
import { ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  navItems: { label: string; value: ViewType; category: string }[];
  width?: number; 
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, navItems, width = 240 }) => {
  const categories = ['목록관리', '운행입력', '현황관리'];

  return (
    <aside 
      style={{ width: `${width}px` }}
      className="bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col space-y-8 no-print shrink-0 overflow-y-auto custom-scrollbar transition-all duration-300"
    >
      {categories.map(cat => (
        <div key={cat} className="space-y-1">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] mb-3 px-4 truncate">
            {cat}
          </h3>
          <div className="space-y-0.5">
            {navItems.filter(item => item.category === cat).map(item => (
              <button
                key={item.value}
                onClick={() => onViewChange(item.value)}
                className={`w-full text-left px-4 py-3 rounded-xl text-[12.5px] font-black transition-all flex items-center border border-transparent truncate ${
                  currentView === item.value 
                    ? 'bg-[#eff6ff] dark:bg-blue-900/20 text-[#2563eb] dark:text-blue-400 border-l-[4px] border-l-[#2563eb] dark:border-l-blue-500 shadow-sm' 
                    : 'text-[#64748b] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100'
                }`}
                title={item.label}
              >
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
      `}</style>
    </aside>
  );
};

export default Sidebar;
