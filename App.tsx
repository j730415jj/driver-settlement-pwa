// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { ViewType, Operation, Client, Vehicle, AuthUser, Dispatch, AdminAccount, UnitPriceMaster, Snippet } from './types';
import { NAV_ITEMS, MOCK_OPERATIONS, MOCK_CLIENTS, MOCK_VEHICLES, MOCK_ADMINS, MOCK_UNIT_PRICES, MOCK_SNIPPETS } from './constants';

// 모든 컴포넌트 임포트 (사진에 있는 모든 기능을 위해)
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

// [사진 b2a125.jpg 반영] 모바일에서 메뉴를 위로 올리고 글씨를 시원하게 키우는 스타일
const globalStyle = `
  @media (max-width: 600px) {
    #root { flex-direction: column !important; }
    aside {
      width: 100% !important; height: auto !important;
      padding: 0 !important; border-right: none !important;
      border-bottom: 2px solid #334155 !important;
      order: -1 !important; /* 메뉴를 무조건 맨 위로 */
    }
    aside nav { 
      flex-direction: row !important; 
      flex-wrap: wrap !important;
      justify-content: flex-start !important; 
      gap: 5px !important; 
      padding: 10px !important;
    }
    aside nav button {
      padding: 8px 12px !important;
      font-size: 14px !important;
      background: #1e293b !important;
      border: 1px solid #334155 !important;
      border-radius: 8px !important;
      white-space: nowrap !important;
    }
    main { width: 100% !important; padding: 10px !important; }
    body { font-size: 18px !important; }
  }
`;

const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>({ id: 'master', role: 'ADMIN', name: '마스터', identifier: '0000' });
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.DASHBOARD);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // 모든 데이터 원상복구
  const [operations, setOperations] = useState<Operation[]>(MOCK_OPERATIONS);
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [unitPrices, setUnitPrices] = useState<UnitPriceMaster[]>(MOCK_UNIT_PRICES);
  const [snippets, setSnippets] = useState<Snippet[]>(MOCK_SNIPPETS);
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>(MOCK_ADMINS);

  const renderView = () => {
    if (!user) return <LoginView onLogin={() => true} />;
    
    const commonProps = { 
      operations, setOperations, clients, setClients, vehicles, setVehicles, 
      unitPrices, setUnitPrices, snippets, setSnippets, dispatches, setDispatches, 
      user, adminAccounts 
    };

    switch (currentView) {
      case ViewType.DASHBOARD: return <DashboardView {...commonProps} />;
      case ViewType.DISPATCH_MGMT: return <DispatchManagementView {...commonProps} />;
      case ViewType.OPERATION_ENTRY: return <OperationEntryView {...commonProps} />;
      case ViewType.CLIENT_REPORT: return <StatementView title="거래처 내역서" type="client" {...commonProps} />;
      case ViewType.MASTER_CLIENT: return <MasterClientView {...commonProps} />;
      case ViewType.MASTER_VEHICLE: return <MasterVehicleView {...commonProps} />;
      case ViewType.MASTER_UNIT_PRICE: return <MasterUnitPriceView {...commonProps} />;
      case ViewType.MASTER_SNIPPET: return <MasterSnippetView {...commonProps} />;
      case ViewType.ACCOUNT_MGMT: return <AccountManagementView {...commonProps} />;
      case ViewType.VEHICLE_TRACKING: return <VehicleTrackingView vehicles={vehicles} />;
      default: return <DashboardView {...commonProps} />;
    }
  };

  return (
    <div id="root" className={`h-screen flex flex-col ${isDarkMode ? 'dark bg-slate-950' : 'bg-slate-100'} overflow-hidden`}>
      <style>{globalStyle}</style>
      {user && <Header user={user} onLogout={() => setUser(null)} isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode(!isDarkMode)} />}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {user && <Sidebar currentView={currentView} onViewChange={setCurrentView} navItems={NAV_ITEMS} width={240} />}
        <main className="flex-1 p-2 overflow-auto bg-slate-100 dark:bg-slate-950">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;