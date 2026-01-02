
import React, { useState } from 'react';
import { AuthUser } from '../types';
import PasswordChangeModal from './PasswordChangeModal';

interface HeaderProps {
  user: AuthUser;
  onLogout: () => void;
  onUpdatePassword: (current: string, next: string) => boolean;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onUpdatePassword, isDarkMode, onToggleTheme }) => {
  const [isPwModalOpen, setIsPwModalOpen] = useState(false);

  return (
    <>
      <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between no-print shadow-sm z-50 transition-colors duration-300">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100 dark:shadow-blue-900/20">
            <span className="text-white font-black text-xl">V</span>
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">베라카 운행관리 시스템</h1>
            <div className="flex items-center space-x-2">
              <span className={`w-1.5 h-1.5 rounded-full ${user.role === 'ADMIN' ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></span>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{user.role} MODE ACTIVE</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-slate-50 dark:bg-slate-800 px-4 py-1.5 rounded-2xl border border-slate-100 dark:border-slate-700 space-x-4 transition-colors">
            {/* 테마 토글 버튼 */}
            <button 
              onClick={onToggleTheme}
              className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all"
              title={isDarkMode ? "라이트 모드로 변경" : "다크 모드로 변경"}
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
              )}
            </button>

            <div className="text-right border-r border-slate-200 dark:border-slate-700 pr-4">
              <p className="text-xs font-black text-slate-700 dark:text-slate-200">{user.name}</p>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">{user.identifier}</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setIsPwModalOpen(true)}
                className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all"
                title="비밀번호 변경"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </button>
              
              <button 
                onClick={onLogout}
                className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"
                title="로그아웃"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {isPwModalOpen && (
        <PasswordChangeModal 
          onClose={() => setIsPwModalOpen(false)} 
          onConfirm={onUpdatePassword} 
        />
      )}
    </>
  );
};

export default Header;
