// @ts-nocheck
import React, { useState, useEffect } from 'react';
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
import LoginView from './components/LoginView';
import Header from './components/Header';
import Sidebar from './components/Sidebar';

const globalStyle = `
  @media (max-width: 600px) {
    #root { flex-direction: column !important; }
    aside { width: 100% !important; height: auto !important; padding: 5px !important; border-bottom: 2px solid #ddd !important; }
    aside nav { flex-direction: row !important; justify-content: space-around !important; }
    main { width: 100% !important; padding: 10px !important; }
  }
`;

const App: React.FC = () => {
  // 1. 로그인 상태 (처음부터 마스터로 로그인된 상태로 설정)
  const [user, setUser] = useState<AuthUser | null>({ id: 'master', role: 'ADMIN', name: '마스터', identifier: '0000' });
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.DASHBOARD);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // 2. 데이터 상태 (기존 MOCK 데이터를 기본값으로 설정하여 '예전 것'이 나오게 함)
  const [operations, setOperations] = useState<Operation[]>(MOCK_OPERATIONS);
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [unitPrices, setUnitPrices] = useState<UnitPriceMaster[]>(MOCK_UNIT_PRICES);
  const [snippets, setSnippets] = useState<Snippet[]>(MOCK_SNIPPETS);
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>(MOCK_ADMINS);

  const handleLogin = (id: string, pw: string) => {
    setUser({ id: 'master', role: 'ADMIN', name: '마스터', identifier: '0000' });
    return true;
  };

  const renderView = () => {
    if (!user) return <LoginView onLogin={handleLogin} />;
    
    // 버튼 클릭 시 데이터를 변경하거나 화면을 바꾸는 함수들
    const props = { 
      operations, setOperations, 
      clients, setClients, 
      vehicles, setVehicles, 
      unitPrices, setUnitPrices, 
      snippets, setSnippets, 
      dispatches, setDispatches, 
      user, adminAccounts 
    };

    switch (currentView) {
      case ViewType.DASHBOARD: return <DashboardView {...props} />;
      case ViewType.OPERATION_ENTRY: 
        return <OperationEntryView {...props} 
          onAddOperation={(newOp) => setOperations([newOp, ...operations])}
          onUpdateOperation={(upOp) => setOperations(operations.map(o => o.id === upOp.id ? upOp : o))}
          onDeleteOperation={(id) => setOperations(operations.filter(o => o.id !== id))}
        />;
      case ViewType.DISPATCH_MGMT: return <DispatchManagementView {...props} onUpdateStatus={() => {}} onAddDispatch={() => {}} onUpdateDispatch={() => {}} onDeleteDispatch={() => {}} />;
      case ViewType.CLIENT_REPORT: return <StatementView title="거래처 내역서" type="client" operations={operations} clients={clients} userRole={user.role} />;
      case ViewType.VEHICLE_REPORT: return <StatementView title="차량거래 내역서" type="vehicle" operations={operations} clients={clients} userRole={user.role} />;
      case ViewType.MASTER_CLIENT: return <MasterClientView clients={clients} onSave={(c) => setClients([...clients.filter(x => x.id !== c.id), c])} onDelete={(id) => setClients(clients.filter(x => x.id !== id))} />;
      default: return <DashboardView {...props} />;
    }
  };

  return (
    <div className={`h-screen flex flex-col ${isDarkMode ? 'dark bg-slate-950' : 'bg-slate-100'} overflow-hidden`}>
      <style>{globalStyle}</style>
      {user && <Header user={user} onLogout={() => setUser(null)} isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode(!isDarkMode)} />}
      <div className="flex flex-1 overflow-hidden">
        {user && <Sidebar currentView={currentView} onViewChange={setCurrentView} navItems={NAV_ITEMS} width={240} />}
        <main className="flex-1 p-2 overflow-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;