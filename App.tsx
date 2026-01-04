// @ts-nocheck
import React, { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { GoogleGenAI } from "@google/genai";
import { createClient } from '@supabase/supabase-js'; 
import { ViewType, Operation, Client, Vehicle, AuthUser, Dispatch, AdminAccount, UnitPriceMaster, Snippet } from './types';
import { NAV_ITEMS, MOCK_OPERATIONS, MOCK_CLIENTS, MOCK_VEHICLES, MOCK_ADMINS, MOCK_UNIT_PRICES, MOCK_SNIPPETS } from './constants';

// 컴포넌트 임포트
import OperationEntryView from './components/OperationEntryView';
import ClientSummaryView from './components/ClientSummaryView';
import StatementView from './components/StatementView';
import MasterClientView from './components/MasterClientView';
import MasterVehicleView from './components/MasterVehicleView';
import MasterUnitPriceView from './components/MasterUnitPriceView';
import MasterSnippetView from './components/MasterSnippetView';
import VehicleTrackingView from './components/VehicleTrackingView';
import DispatchManagementView from './components/DispatchManagementView';
import AccountManagementView from './components/AccountManagementView';
import DashboardView from './components/DashboardView';
import ChangePasswordView from './components/ChangePasswordView';
import LoginView from './components/LoginView';
import Header from './components/Header';
import Sidebar from './components/Sidebar';

// 1. 모바일 레이아웃 고정 스타일
const globalStyle = `
  @media (max-width: 600px) {
    #root { flex-direction: column !important; }
    aside {
      width: 100% !important; height: auto !important; min-height: 60px !important;
      padding: 5px !important; border-right: none !important; border-bottom: 2px solid #ddd !important;
    }
    aside nav { flex-direction: row !important; justify-content: space-around !important; gap: 10px !important; }
    main { width: 100% !important; padding: 10px !important; overflow-x: auto !important; }
    body, html { font-size: 20px !important; }
    input, select { 
      height: 55px !important; font-size: 22px !important; 
      color: black !important; border: 2px solid black !important; background-color: white !important;
    }
    button { min-height: 60px !important; font-size: 20px !important; font-weight: bold !important; }
  }
`;

// 2. 인증 컨텍스트 설정 (LoginView 에러 해결 핵심)
const AuthContext = createContext<any>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

const SUPABASE_URL = 'https://jvzeonopbybtqnyyboje.supabase.co';
const SUPABASE_KEY = 'sb_publishable_CX1kIgpV8nNIQZJHJYEcBw_BRPzf3D8';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.DASHBOARD);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(240);

  // 데이터 상태 관리
  const [operations, setOperations] = useState<Operation[]>(MOCK_OPERATIONS);
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [unitPrices, setUnitPrices] = useState<UnitPriceMaster[]>(MOCK_UNIT_PRICES);
  const [snippets, setSnippets] = useState<Snippet[]>(MOCK_SNIPPETS);
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>(MOCK_ADMINS);

  // 로그인 로직
  const handleLogin = (identifier: string, password?: string) => {
    if (identifier === '0000' && password === '0000') {
      setUser({ id: 'master', role: 'ADMIN', name: '마스터', identifier: '0000' });
      return true;
    }
    const admin = adminAccounts.find(a => a.username === identifier && a.password === password);
    if (admin) {
      setUser({ id: admin.id, role: 'ADMIN', name: admin.name, identifier: admin.username });
      return true;
    }
    const vehicle = vehicles.find(v => v.loginCode === identifier && (v.password === password || (!v.password && v.loginCode === password)));
    if (vehicle) {
      setUser({ id: vehicle.id, role: 'VEHICLE', name: vehicle.ownerName, identifier: vehicle.vehicleNo });
      return true;
    }
    return false;
  };

  const handleLogout = () => setUser(null);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // 화면 렌더링 함수
  const renderView = () => {
    if (!user) return <LoginView onLogin={handleLogin} />;
    
    const props = { operations, clients, vehicles, unitPrices, snippets, dispatches, user, adminAccounts };

    switch (currentView) {
      case ViewType.DASHBOARD: return <DashboardView {...props} />;
      case ViewType.DISPATCH_MGMT: return <DispatchManagementView {...props} onUpdateStatus={() => {}} onAddDispatch={() => {}} onUpdateDispatch={() => {}} onDeleteDispatch={() => {}} />;
      case ViewType.ACCOUNT_MGMT: return <AccountManagementView {...props} onSaveVehicle={() => {}} onDeleteVehicle={() => {}} onAddVehicle={() => {}} onAddAdmin={() => {}} onUpdateAdmin={() => {}} onDeleteAdmin={() => {}} />;
      case ViewType.VEHICLE_TRACKING: return <VehicleTrackingView vehicles={vehicles} />;
      default: return <DashboardView {...props} />;
    }
  };

  const navItems = NAV_ITEMS.filter(item => item.roles.includes(user?.role || ''));

  return (
    <AuthContext.Provider value={{ user, login: handleLogin, logout: handleLogout }}>
      <div className={`h-screen flex flex-col ${isDarkMode ? 'dark bg-slate-950' : 'bg-slate-100'} overflow-hidden`}>
        <style>{globalStyle}</style>
        {user && <Header user={user} onLogout={handleLogout} isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />}
        <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
          {user && <Sidebar currentView={currentView} onViewChange={setCurrentView} navItems={navItems} width={leftSidebarWidth} />}
          <main className="flex-1 p-1 overflow-auto">
            {renderView()}
          </main>
        </div>
      </div>
    </AuthContext.Provider>
  );
};

export default App;