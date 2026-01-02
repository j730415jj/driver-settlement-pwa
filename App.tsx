/* Mobile Layout Fixed: 모바일에서 메뉴 위로 올리기 */
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

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { createClient } from '@supabase/supabase-js'; 
import { ViewType, Operation, Client, Vehicle, AuthUser, Dispatch, AdminAccount, UnitPriceMaster, Snippet } from './types';
import { NAV_ITEMS, MOCK_OPERATIONS, MOCK_CLIENTS, MOCK_VEHICLES, MOCK_ADMINS, MOCK_UNIT_PRICES, MOCK_SNIPPETS } from './constants';
// ... 아래 코드는 그대로 두세요 ...
import { NAV_ITEMS, MOCK_OPERATIONS, MOCK_CLIENTS, MOCK_VEHICLES, MOCK_ADMINS, MOCK_UNIT_PRICES, MOCK_SNIPPETS } from './constants';
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

// ▼▼▼▼▼▼▼▼▼▼ 사장님, 여기만 진짜 정보로 바꿔주세요! ▼▼▼▼▼▼▼▼▼▼
const SUPABASE_URL = 'https://jvzeonopbybtqnyyboje.supabase.co.supabase.co';
const SUPABASE_KEY = 'sb_publishable_CX1kIgpV8nNIQZJHJYEcBw_BRPzf3D8';
// ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

// Supabase 연결 (주소가 없으면 연결하지 않음)
const supabase = (SUPABASE_URL.includes('여기에') || SUPABASE_KEY.includes('여기에')) 
  ? null 
  : createClient(SUPABASE_URL, SUPABASE_KEY);

const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.DASHBOARD);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(240);
  const isResizingLeft = useRef(false);

  // Sidebar resize handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingLeft.current) return;
      const newWidth = e.clientX;
      if (newWidth > 180 && newWidth < 450) {
        setLeftSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      isResizingLeft.current = false;
      document.body.style.cursor = 'default';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleResizeStart = () => {
    isResizingLeft.current = true;
    document.body.style.cursor = 'col-resize';
  };

  // 알림 권한 요청
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  const triggerNotification = (title: string, body: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const [operations, setOperations] = useState<Operation[]>(() => {
    const saved = localStorage.getItem('v_operations');
    return saved ? JSON.parse(saved) : MOCK_OPERATIONS;
  });
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('v_clients');
    return saved ? JSON.parse(saved) : MOCK_CLIENTS;
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('v_vehicles');
    return saved ? JSON.parse(saved) : MOCK_VEHICLES;
  });
  const [unitPrices, setUnitPrices] = useState<UnitPriceMaster[]>(() => {
    const saved = localStorage.getItem('v_unit_prices');
    return saved ? JSON.parse(saved) : MOCK_UNIT_PRICES;
  });
  const [snippets, setSnippets] = useState<Snippet[]>(() => {
    const saved = localStorage.getItem('v_snippets');
    return saved ? JSON.parse(saved) : MOCK_SNIPPETS;
  });
  const [dispatches, setDispatches] = useState<Dispatch[]>(() => {
    const saved = localStorage.getItem('v_dispatches');
    return saved ? JSON.parse(saved) : [];
  });
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>(() => {
    const saved = localStorage.getItem('v_admins');
    return saved ? JSON.parse(saved) : MOCK_ADMINS;
  });

  // 90일 지난 사진 자동 삭제 기능 (로컬 데이터용)
  useEffect(() => {
    const cleanupOldPhotos = () => {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const limitDateStr = ninetyDaysAgo.toISOString().split('T')[0];

      let cleanedCount = 0;
      const updatedOperations = operations.map(op => {
        if (!op.invoicePhoto || op.date >= limitDateStr) return op;
        cleanedCount++;
        return { ...op, invoicePhoto: undefined };
      });

      if (cleanedCount > 0) {
        setOperations(updatedOperations);
        console.log(`[자동 정리] 90일이 경과한 송장 사진 ${cleanedCount}건을 정리했습니다.`);
      }
    };
    cleanupOldPhotos();
  }, []);

  useEffect(() => { localStorage.setItem('v_operations', JSON.stringify(operations)); }, [operations]);
  useEffect(() => { localStorage.setItem('v_clients', JSON.stringify(clients)); }, [clients]);
  useEffect(() => { localStorage.setItem('v_vehicles', JSON.stringify(vehicles)); }, [vehicles]);
  useEffect(() => { localStorage.setItem('v_unit_prices', JSON.stringify(unitPrices)); }, [unitPrices]);
  useEffect(() => { localStorage.setItem('v_snippets', JSON.stringify(snippets)); }, [snippets]);
  useEffect(() => { localStorage.setItem('v_dispatches', JSON.stringify(dispatches)); }, [dispatches]);
  useEffect(() => { localStorage.setItem('v_admins', JSON.stringify(adminAccounts)); }, [adminAccounts]);

  // AI 중량 추출 함수
  const extractWeightFromImage = async (base64Data: string): Promise<number | null> => {
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const base64Content = base64Data.split(',')[1] || base64Data;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash', 
        contents: [
          {
            parts: [
              { text: "이 이미지는 물류 송장 또는 계량 증명서입니다. 이미지에서 '실중량', '계량중량', 'Net Weight', '중량' 등의 키워드 옆에 있는 숫자(단위: 톤 또는 kg)를 찾아 숫자만 반환하세요. 만약 숫자가 1000 이상이면 kg으로 간주하여 1000으로 나누어 톤 단위로 변환하세요. 숫자만 응답하세요. 찾을 수 없으면 0이라고 응답하세요." },
              { inlineData: { mimeType: "image/jpeg", data: base64Content } }
            ]
          }
        ]
      });

      const resultText = response.text?.trim() || "0";
      const weight = parseFloat(resultText.replace(/[^0-9.]/g, ''));
      return weight > 0 ? weight : null;
    } catch (error) {
      console.error("AI Weight Extraction Error:", error);
      return null;
    }
  };

  // ★★★ [새 기능] 기사님이 찍은 사진을 Supabase(우체통)로 보내는 함수 ★★★
  const uploadPhotoToSupabase = async (id: string, base64Photo: string) => {
    if (!supabase) return;

    try {
      // 1. Base64 사진을 파일(Blob)로 변환
      const byteString = atob(base64Photo.split(',')[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
      const blob = new Blob([ab], { type: 'image/jpeg' });

      // 2. 파일 이름 생성 (차량번호_날짜_시간.jpg)
      const fileName = `dispatch_${id}_${Date.now()}.jpg`;

      // 3. Supabase로 업로드
      const { data, error } = await supabase.storage
        .from('operation_photos') // 바구니 이름
        .upload(fileName, blob);

      if (error) {
        console.error('Supabase 업로드 실패:', error);
      } else {
        console.log('✅ Supabase 업로드 성공 (NAS가 수거해갈 예정):', fileName);
        triggerNotification("사진 전송 완료", "본부 서버로 사진이 안전하게 전송되었습니다.");
      }
    } catch (err) {
      console.error('사진 변환 중 오류:', err);
    }
  };

  const handleUpdateDispatchStatus = async (id: string, status: 'pending' | 'sent' | 'completed', photo?: string, manualQuantity?: number) => {
    setDispatches(prev => prev.map(d => d.id === id ? { ...d, status } : d));
    
    // 연동된 운행 내역 업데이트
    if (status === 'completed') {
      const dispatch = dispatches.find(d => d.id === id);
      if (dispatch) {
        
        // ★★★ [추가됨] 사진이 있으면 Supabase로 전송 (NAS 수거용) ★★★
        if (photo) {
           uploadPhotoToSupabase(id, photo);
        }

        setOperations(prev => prev.map(op => {
          if (op.id === `op-from-dispatch-${id}`) {
            const finalQty = manualQuantity || op.quantity;
            const supplyPrice = Math.round(op.unitPrice * finalQty);
            const tax = Math.round(supplyPrice * 0.1);
            
            return { 
              ...op, 
              invoicePhoto: photo || op.invoicePhoto,
              quantity: finalQty,
              supplyPrice,
              tax,
              totalAmount: supplyPrice + tax,
              remarks: manualQuantity ? (op.remarks || '') + " [기사 직접입력]" : op.remarks
            };
          }
          return op;
        }));

        // 사진이 있고 수동 입력이 없는 경우 AI 추출 시도 (기존 기능 유지)
        if (photo && !manualQuantity) {
          triggerNotification("📄 송장 처리 중", "AI가 송장에서 중량을 추출하고 있습니다...");
          const extractedWeight = await extractWeightFromImage(photo);
          
          if (extractedWeight !== null) {
            setOperations(prev => prev.map(op => {
              if (op.id === `op-from-dispatch-${id}`) {
                const supplyPrice = Math.round(op.unitPrice * extractedWeight);
                const tax = Math.round(supplyPrice * 0.1);
                return { 
                  ...op, 
                  quantity: extractedWeight,
                  supplyPrice,
                  tax,
                  totalAmount: supplyPrice + tax,
                  remarks: (op.remarks || '') + " [AI 자동입력됨]"
                };
              }
              return op;
            }));
            triggerNotification("✅ 중량 추출 완료", `실중량 ${extractedWeight}t이 자동으로 입력되었습니다.`);
          }
        }
      }
    }
  };

  const handleLogin = (identifier: string, password?: string) => {
    if (password === undefined) return false;
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

  const handleAddOperation = (newOp: Operation) => setOperations(prev => [newOp, ...prev]);
  const handleUpdateOperation = (updatedOp: Operation) => setOperations(prev => prev.map(op => op.id === updatedOp.id ? updatedOp : op));
  const handleDeleteOperation = (id: string) => { if (window.confirm('삭제하시겠습니까?')) setOperations(prev => prev.filter(op => op.id !== id)); };

  const handleAddDispatch = (dispatch: Dispatch) => {
    setDispatches(prev => [dispatch, ...prev]);
    const alreadyExists = snippets.some(s => s.origin === dispatch.origin && s.destination === dispatch.destination && s.item === dispatch.item);
    if (!alreadyExists) {
      const newSnippet: Snippet = {
        id: `sn-auto-${Date.now()}`,
        keyword: dispatch.origin.slice(0, 10).trim(), 
        clientName: dispatch.clientName,
        origin: dispatch.origin,
        destination: dispatch.destination,
        item: dispatch.item
      };
      setSnippets(prev => [newSnippet, ...prev]);
    }
    
    const matchedPrice = unitPrices.find(up => up.origin === dispatch.origin && up.destination === dispatch.destination && up.item === dispatch.item);
    let defaultUnitPrice = matchedPrice ? matchedPrice.unitPrice : 0;
    let defaultClientUnitPrice = matchedPrice ? matchedPrice.clientUnitPrice : 0;
    
    const newOp: Operation = {
      id: `op-from-dispatch-${dispatch.id}`, 
      date: dispatch.date,
      vehicleNo: dispatch.vehicleNo,
      clientName: dispatch.clientName || '미지정',
      clientUnitPrice: defaultClientUnitPrice,
      origin: dispatch.origin,
      destination: dispatch.destination,
      itemCode: 'DISPATCH',
      item: dispatch.item,
      itemDescription: '배차 자동 연동',
      unitPrice: defaultUnitPrice,
      quantity: 0,
      supplyPrice: 0,
      tax: 0,
      totalAmount: 0,
      settlementStatus: 'PENDING',
      isVatIncluded: false
    };
    handleAddOperation(newOp);
  };

  const handleUpdateDispatch = (updated: Dispatch) => {
    setDispatches(prev => prev.map(d => d.id === updated.id ? updated : d));
    setOperations(prev => prev.map(op => {
      if (op.id === `op-from-dispatch-${updated.id}`) {
        return { ...op, vehicleNo: updated.vehicleNo, clientName: updated.clientName, origin: updated.origin, destination: updated.destination, item: updated.item };
      }
      return op;
    }));
  };

  const handleDeleteDispatch = (id: string) => {
    if (window.confirm('배차 내역을 삭제하시겠습니까?')) {
      setDispatches(prev => prev.filter(d => d.id !== id));
      setOperations(prev => prev.filter(op => op.id !== `op-from-dispatch-${id}`));
    }
  };

  const renderView = () => {
    if (!user) return <LoginView onLogin={handleLogin} />;
    const filteredVehicles = user.role === 'VEHICLE' ? vehicles.filter(v => v.vehicleNo === user.identifier) : vehicles;
    const filteredOperations = user.role === 'VEHICLE' ? operations.filter(op => op.vehicleNo === user.identifier) : operations;

    switch (currentView) {
      case ViewType.DASHBOARD:
        return <DashboardView operations={filteredOperations} vehicles={filteredVehicles} dispatches={dispatches} />;
      case ViewType.DISPATCH_MGMT:
        return <DispatchManagementView user={user} dispatches={dispatches} vehicles={vehicles} clients={clients} snippets={snippets} operations={operations} onAddDispatch={handleAddDispatch} onUpdateDispatch={handleUpdateDispatch} onDeleteDispatch={handleDeleteDispatch} onUpdateStatus={handleUpdateDispatchStatus} />;
      case ViewType.OPERATION_ENTRY:
        return <OperationEntryView operations={operations} vehicles={vehicles} clients={clients} unitPriceMaster={unitPrices} onAddOperation={handleAddOperation} onUpdateOperation={handleUpdateOperation} onDeleteOperation={handleDeleteOperation} />;
      case ViewType.CLIENT_SUMMARY: return <ClientSummaryView operations={operations} />;
      case ViewType.CLIENT_REPORT: return <StatementView title="거래처 내역서" type="client" operations={operations} clients={clients} userRole={user.role} userIdentifier={user.identifier} />;
      case ViewType.VEHICLE_REPORT: return <StatementView title="차량거래 내역서" type="vehicle" operations={filteredOperations} clients={clients} userRole={user.role} userIdentifier={user.identifier} />;
      case ViewType.COMPANY_REPORT: return <StatementView title="상호별 내역서" type="company" operations={operations} clients={clients} userRole={user.role} userIdentifier={user.identifier} />;
      case ViewType.TAX_INVOICE: return <StatementView title="세금 계산서" type="client" operations={operations} clients={clients} userRole={user.role} userIdentifier={user.identifier} />;
      case ViewType.MASTER_CLIENT: return <MasterClientView clients={clients} onSave={c => setClients(prev => [...prev.filter(x => x.id !== c.id), c])} onDelete={id => setClients(prev => prev.filter(x => x.id !== id))} />;
      case ViewType.MASTER_VEHICLE: return <MasterVehicleView vehicles={vehicles} onSave={v => setVehicles(prev => [...prev.filter(x => x.id !== v.id), v])} onDelete={id => setVehicles(prev => prev.filter(x => x.id !== id))} />;
      case ViewType.MASTER_UNIT_PRICE: return <MasterUnitPriceView unitPrices={unitPrices} onSave={up => setUnitPrices(prev => [...prev.filter(x => x.id !== up.id), up])} onDelete={id => setUnitPrices(prev => prev.filter(x => x.id !== id))} clients={clients} />;
      case ViewType.MASTER_SNIPPET: return <MasterSnippetView snippets={snippets} onSave={s => setSnippets(prev => [...prev.filter(x => x.id !== s.id), s])} onDelete={id => setSnippets(prev => prev.filter(x => x.id !== id))} clients={clients} />;
      case ViewType.VEHICLE_TRACKING: return <VehicleTrackingView vehicles={filteredVehicles} />;
      case ViewType.CHANGE_PASSWORD: return <ChangePasswordView user={user} onUpdatePassword={(c, n) => {
          if (!user) return false;
          if (user.role === 'ADMIN') {
            if (user.id === 'master') return false;
            const admin = adminAccounts.find(a => a.id === user.id);
            if (admin && admin.password === c) {
              setAdminAccounts(prev => prev.map(a => a.id === user.id ? { ...a, password: n } : a));
              return true;
            }
          } else if (user.role === 'VEHICLE') {
            const vehicle = vehicles.find(v => v.id === user.id);
            if (vehicle && vehicle.password === c) {
              setVehicles(prev => prev.map(v => v.id === user.id ? { ...v, password: n } : v));
              return true;
            }
          }
          return false;
      }} />;
      case ViewType.ACCOUNT_MGMT:
        return <AccountManagementView vehicles={vehicles} adminAccounts={adminAccounts} onSaveVehicle={v => setVehicles(prev => [...prev.filter(x => x.id !== v.id), v])} onDeleteVehicle={id => setVehicles(prev => prev.filter(x => x.id !== id))} onAddVehicle={v => setVehicles(prev => [v, ...prev])} onAddAdmin={a => setAdminAccounts(prev => [a, ...prev])} onUpdateAdmin={a => setAdminAccounts(prev => prev.map(x => x.id === a.id ? a : x))} onDeleteAdmin={id => setAdminAccounts(prev => prev.filter(x => x.id !== id))} />;
      default: return <DashboardView operations={filteredOperations} vehicles={filteredVehicles} dispatches={dispatches} />;
    }
  };

  const filteredNavItems = NAV_ITEMS.filter(item => item.roles.includes(user?.role || ''));
  const finalNavItems = user?.role === 'ADMIN' ? [{ label: '대시보드', value: ViewType.DASHBOARD, category: '목록관리', roles: ['ADMIN'] }, ...filteredNavItems] : filteredNavItems;

return (
    <div className={`h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-950' : 'bg-slate-100'} overflow-hidden`}>
      
      <style>{globalStyle}</style>

      {user && <Header user={user} onLogout={handleLogout} onUpdatePassword={(c, n) => {
        if (!user) return false;
        if (user.role === 'ADMIN') {
          if (user.id === 'master') return false;
          const admin = adminAccounts.find(a => a.id === user.id);
          if (admin && admin.password === c) {
            setAdminAccounts(prev => prev.map(a => a.id === user.id ? { ...a, password: n } : a));
            return true;
          }
        } else if (user.role === 'VEHICLE') {
          const vehicle = vehicles.find(v => v.id === user.id);
          if (vehicle && vehicle.password === c) {
            setVehicles(prev => prev.map(v => v.id === user.id ? { ...v, password: n } : v));
            return true;
          }
        }
        return false;
      }} isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />}
      
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {user && (
          <>
            <Sidebar currentView={currentView} onViewChange={setCurrentView} navItems={finalNavItems} width={leftSidebarWidth} />
            <div 
              onMouseDown={handleResizeStart} 
              className="w-1 hover:w-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-blue-400 dark:hover:bg-blue-600 cursor-col-resize transition-all shrink-0 no-print flex items-center justify-center group z-50"
            >
              <div className="w-[1px] h-10 bg-slate-300 dark:bg-slate-700 group-hover:bg-blue-300"></div>
            </div>
          </>
        )}
        <main className={`flex-1 ${user ? 'p-1' : ''} overflow-auto bg-slate-100 dark:bg-slate-950 transition-colors duration-300`}>
          {renderView()}
        </main>
      </div>
    </div>
  );

export default App;