
import React, { useState } from 'react';

interface Props {
  onLogin: (identifier: string, password?: string) => boolean;
}

const LoginView: React.FC<Props> = ({ onLogin }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(identifier, password);
    if (!success) {
      setError('접속 정보가 올바르지 않습니다.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 transform transition-all">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-3xl font-black">V</span>
          </div>
          <h2 className="text-2xl font-black text-slate-800">베라카 운행관리 시스템</h2>
          <p className="text-slate-400 text-sm mt-2">Logistics Management Portal</p>
        </div>

        <div className="flex mb-8 bg-slate-100 p-1.5 rounded-2xl">
          <button 
            onClick={() => { setIsAdmin(false); setError(''); setIdentifier(''); setPassword(''); }}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${!isAdmin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            차량 로그인
          </button>
          <button 
            onClick={() => { setIsAdmin(true); setError(''); setIdentifier(''); setPassword(''); }}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${isAdmin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            관리자 로그인
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
              {isAdmin ? '관리자 아이디' : '차량번호 뒤 4자리 (ID)'}
            </label>
            <input 
              type="text" 
              required
              placeholder={isAdmin ? 'admin' : '5017'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">비밀번호</label>
            <input 
              type="password" 
              required
              placeholder="••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            시스템 접속
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-slate-100 text-center">
          <p className="text-slate-400 text-xs">계정 문의: 054-285-1300</p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
