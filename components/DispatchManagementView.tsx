
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AuthUser, Dispatch, Vehicle, Client, Snippet, Operation, ViewType } from '../types';

interface Props {
  user: AuthUser;
  dispatches: Dispatch[];
  vehicles: Vehicle[];
  clients: Client[];
  snippets: Snippet[];
  operations: Operation[];
  onAddDispatch: (d: Dispatch) => void;
  onUpdateDispatch: (d: Dispatch) => void;
  onDeleteDispatch: (id: string) => void;
  onUpdateStatus: (id: string, status: 'pending' | 'sent' | 'completed', photo?: string, manualQuantity?: number) => void;
  onNavigate?: (view: ViewType) => void; // 네비게이션 함수 추가
}

const DispatchManagementView: React.FC<Props> = ({ 
  user, 
  dispatches, 
  vehicles, 
  clients, 
  snippets, 
  operations,
  onAddDispatch, 
  onUpdateDispatch,
  onDeleteDispatch,
  onUpdateStatus,
  onNavigate
}) => {
  const [newDispatch, setNewDispatch] = useState({ 
    vehicleNo: '', 
    clientName: '',
    origin: '', 
    destination: '', 
    item: '', 
    count: 1, 
    remarks: '' 
  });
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Dispatch | null>(null);

  // 모달 및 사진 관련 상태
  const [cameraOpen, setCameraOpen] = useState(false);
  const [activeDispatchId, setActiveDispatchId] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [rotation, setRotation] = useState(0); 
  const [zoomScale, setZoomScale] = useState(1); // 확대 배율 상태 추가
  
  // 수량 입력 상태
  const [modalQuantity, setModalQuantity] = useState('');
  const [cardQuantities, setCardQuantities] = useState<Record<string, string>>({});

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const recentData = useMemo(() => {
    const getUniqueRecent = (key: 'origin' | 'destination' | 'item' | 'remarks') => {
      const fromDispatches = dispatches.map(d => String(d[key as keyof Dispatch] || ''));
      const fromOps = operations.map(o => String(o[key as keyof Operation] || ''));
      const combined = [...fromDispatches, ...fromOps].map(v => v.trim()).filter(v => v !== '' && v !== 'undefined' && v !== 'null');
      return Array.from(new Set(combined)).reverse().slice(0, 8);
    };
    return { origin: getUniqueRecent('origin'), destination: getUniqueRecent('destination'), item: getUniqueRecent('item'), remarks: getUniqueRecent('remarks') };
  }, [dispatches, operations]);

  const handleOriginChange = (val: string) => {
    setNewDispatch(prev => ({ ...prev, origin: val }));
    const match = snippets.find(s => s.keyword === val);
    if (match) {
      setNewDispatch(prev => ({
        ...prev,
        origin: match.origin,
        destination: match.destination,
        item: match.item,
        clientName: match.clientName || prev.clientName
      }));
    }
  };

  const applySnippet = (s: Snippet) => {
    setNewDispatch(prev => ({ ...prev, origin: s.origin, destination: s.destination, item: s.item, clientName: s.clientName || prev.clientName }));
  };

  const selectSuggestion = (field: string, value: string) => {
    if (field === 'origin') handleOriginChange(value);
    else setNewDispatch(prev => ({ ...prev, [field]: value } as any));
  };

  const handleCreateDispatch = () => {
    if (!newDispatch.vehicleNo || !newDispatch.origin || !newDispatch.destination) {
      alert('차량, 상차지, 하차지는 필수 입력 사항입니다.');
      return;
    }
    const d: Dispatch = { id: Date.now().toString(), date: new Date().toISOString().split('T')[0], vehicleNo: newDispatch.vehicleNo, clientName: newDispatch.clientName || '미지정', origin: newDispatch.origin, destination: newDispatch.destination, item: newDispatch.item, count: newDispatch.count, remarks: newDispatch.remarks, status: 'pending' };
    onAddDispatch(d);
    setNewDispatch({ vehicleNo: '', clientName: '', origin: '', destination: '', item: '', count: 1, remarks: '' });
  };

  const startEditing = (d: Dispatch) => { setEditingId(d.id); setEditForm({ ...d }); };
  const saveEdit = () => { if (editForm) { onUpdateDispatch(editForm); setEditingId(null); setEditForm(null); } };
  
  const userDispatches = dispatches.filter(d => user.role === 'ADMIN' || d.vehicleNo === user.identifier);

  const renderChips = (field: keyof typeof recentData) => {
    const items = recentData[field];
    const matchingSnippets = field === 'origin' ? snippets.filter(s => s.keyword.includes(newDispatch.origin) || s.origin.includes(newDispatch.origin)) : [];
    if (items.length === 0 && matchingSnippets.length === 0) return null;
    return (
      <div className="mt-1.5 flex flex-wrap gap-1.5 min-h-[24px]">
        {field === 'origin' && matchingSnippets.map(s => <button key={`snip-${s.id}`} type="button" onClick={() => applySnippet(s)} className="bg-blue-600 text-white px-2.5 py-1 rounded-full text-[10px] font-black hover:bg-blue-700 transition shadow-sm">⭐ {s.keyword}</button>)}
        {items.map((item, idx) => <button key={`${String(field)}-${idx}`} type="button" onClick={() => selectSuggestion(String(field), item)} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-full text-[10px] font-bold hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 transition border border-slate-200 dark:border-slate-700">{item}</button>)}
      </div>
    );
  };

  const closeCameraModal = () => {
    setCameraOpen(false);
    setCapturedPhoto(null);
    setModalQuantity('');
    setRotation(0);
    setZoomScale(1);
    setActiveDispatchId(null);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // 사진 확인 후 최종 전송
  const handleFinalSubmit = async () => {
    if (!activeDispatchId) return;
    if (!modalQuantity) {
      if (!window.confirm('실수량을 입력하지 않았습니다. 전송하시겠습니까?')) return;
    }

    setIsProcessingAI(true);
    const quantity = modalQuantity ? parseFloat(modalQuantity) : undefined;
    await onUpdateStatus(activeDispatchId, 'completed', capturedPhoto || undefined, quantity);
    
    setIsProcessingAI(false);
    closeCameraModal();
  };

  return (
    <div className="space-y-6 pb-24">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onloadend = () => { 
              setCapturedPhoto(reader.result as string); 
              setCameraOpen(true); 
              if (activeDispatchId && cardQuantities[activeDispatchId]) {
                setModalQuantity(cardQuantities[activeDispatchId]);
              }
            };
            reader.readAsDataURL(file);
          }
        }} 
        accept="image/*" 
        className="hidden" 
      />

      <div className="flex justify-between items-center px-4 md:px-0 pt-2">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">배차 관리</h2>
          <p className="text-slate-500 text-sm">실시간 배차 현황 및 운행 확인</p>
        </div>
        
        {/* 기사님 전용 홈 바로가기 버튼 */}
        {user.role === 'VEHICLE' && onNavigate && (
          <button 
            onClick={() => onNavigate(ViewType.DASHBOARD)}
            className="flex items-center space-x-2 bg-slate-800 text-white px-4 py-2 rounded-xl font-black text-sm hover:bg-slate-700 active:scale-95 transition shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            <span>홈으로</span>
          </button>
        )}
      </div>

      {user.role === 'ADMIN' && (
        <div className="mx-4 md:mx-0 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-black text-slate-700 dark:text-slate-200 flex items-center text-sm">배차 정보 입력</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6 items-start">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">차량 선택</label>
              <select value={newDispatch.vehicleNo} onChange={e => setNewDispatch(p => ({ ...p, vehicleNo: e.target.value }))} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 dark:text-slate-100 font-bold">
                <option value="">차량을 선택하세요</option>
                {vehicles.map(v => <option key={v.id} value={v.vehicleNo}>{v.vehicleNo} ({v.ownerName})</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">거래처 선택</label>
              <select value={newDispatch.clientName} onChange={e => setNewDispatch(p => ({ ...p, clientName: e.target.value }))} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 font-bold text-blue-600 dark:text-blue-400">
                <option value="">거래처를 선택하세요</option>
                {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">상차지</label>
              <input placeholder="상차지" autoComplete="off" value={newDispatch.origin} onChange={e => handleOriginChange(e.target.value)} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:text-slate-100 font-bold" />
              {renderChips('origin')}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">하차지</label>
              <input placeholder="하차지" autoComplete="off" value={newDispatch.destination} onChange={e => setNewDispatch(p => ({ ...p, destination: e.target.value }))} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:text-slate-100 font-bold" />
              {renderChips('destination')}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">품명</label>
              <input placeholder="품명" autoComplete="off" value={newDispatch.item} onChange={e => setNewDispatch(p => ({ ...p, item: e.target.value }))} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:text-slate-100 font-bold" />
              {renderChips('item')}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">회전수</label>
              <input type="number" value={newDispatch.count} onChange={e => setNewDispatch(p => ({ ...p, count: parseInt(e.target.value) || 0 }))} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-center bg-white dark:bg-slate-800 dark:text-slate-100 font-black" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">비고 및 참조</label>
              <input placeholder="참조사항" autoComplete="off" value={newDispatch.remarks} onChange={e => setNewDispatch(p => ({ ...p, remarks: e.target.value }))} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:text-slate-100 font-bold" />
              {renderChips('remarks')}
            </div>
            <div className="pt-5">
              <button onClick={handleCreateDispatch} className="w-full bg-blue-600 text-white rounded-xl py-3 font-black hover:bg-blue-700 transition shadow-lg text-sm active:scale-95">배차 생성 및 전송</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-0">
        {userDispatches.map(d => {
          const isEditing = editingId === d.id;
          
          return (
            <div key={d.id} className={`bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border transition-all hover:shadow-md ${d.status === 'completed' ? 'border-green-100 dark:border-green-900/30' : 'border-slate-100 dark:border-slate-800'} ${isEditing ? 'ring-2 ring-blue-500' : ''}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="w-full">
                  {!isEditing ? (
                    <>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{d.vehicleNo}</span>
                        <span className="text-[9px] text-slate-300">|</span>
                        <span className="text-[10px] font-bold text-slate-400">{d.date}</span>
                      </div>
                      <div className="mt-1">
                         <h4 className="font-black text-slate-800 dark:text-slate-100 text-lg leading-tight">{d.origin} → {d.destination}</h4>
                         <span className="text-xs font-bold text-rose-500 dark:text-rose-400">거래처: {d.clientName}</span>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                       <input value={editForm?.origin} onChange={e => setEditForm(prev => prev ? ({ ...prev, origin: e.target.value }) : null)} className="w-full border rounded-lg px-2 py-1 text-xs dark:bg-slate-800 dark:text-slate-100" placeholder="상차지" />
                       <input value={editForm?.destination} onChange={e => setEditForm(prev => prev ? ({ ...prev, destination: e.target.value }) : null)} className="w-full border rounded-lg px-2 py-1 text-xs dark:bg-slate-800 dark:text-slate-100" placeholder="하차지" />
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {d.item && <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-lg text-[10px] font-black border border-blue-100 dark:border-blue-800">📦 {d.item}</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`text-[10px] px-2 py-1 rounded-full font-black shrink-0 ${d.status === 'pending' ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' : d.status === 'sent' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-300'}`}>
                    {d.status === 'pending' ? '대기중' : d.status === 'sent' ? '배차중' : '완료됨'}
                  </span>
                  {user.role === 'ADMIN' && (
                    <div className="flex space-x-1">
                       <button onClick={() => startEditing(d)} className="p-1 text-slate-300 hover:text-blue-500"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
                       <button onClick={() => onDeleteDispatch(d.id)} className="p-1 text-slate-300 hover:text-red-500"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                    </div>
                  )}
                </div>
              </div>

              {user.role === 'VEHICLE' && d.status === 'sent' && (
                <div className="flex flex-col space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">실수량(t) 미리 입력</label>
                    <input 
                      type="number" 
                      inputMode="decimal"
                      placeholder="0.00"
                      value={cardQuantities[d.id] || ''}
                      onChange={(e) => setCardQuantities(prev => ({ ...prev, [d.id]: e.target.value }))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-lg font-black text-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={async () => {
                        setActiveDispatchId(d.id);
                        setCameraOpen(true);
                        setCapturedPhoto(null);
                        setModalQuantity(cardQuantities[d.id] || '');
                        try {
                          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                          if (videoRef.current) videoRef.current.srcObject = stream;
                        } catch (err) { alert('카메라 권한이 필요합니다.'); setCameraOpen(false); }
                      }} 
                      className="bg-white border-2 border-slate-200 dark:border-slate-800 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl py-4 text-sm font-black flex flex-col items-center justify-center space-y-1 active:scale-95 shadow-sm"
                    >
                      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path></svg>
                      <span>현장 촬영</span>
                    </button>
                    <button 
                      onClick={() => { 
                        setActiveDispatchId(d.id); 
                        if (fileInputRef.current) fileInputRef.current.click(); 
                      }} 
                      className="bg-white border-2 border-slate-200 dark:border-slate-800 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl py-4 text-sm font-black flex flex-col items-center justify-center space-y-1 active:scale-95 shadow-sm"
                    >
                      <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      <span>송장 불러오기</span>
                    </button>
                  </div>

                  <button 
                    onClick={() => {
                      const qty = cardQuantities[d.id] ? parseFloat(cardQuantities[d.id]) : undefined;
                      if (!qty) {
                        if (!window.confirm('중량을 입력하지 않았습니다. 계속하시겠습니까?')) return;
                      }
                      onUpdateStatus(d.id, 'completed', undefined, qty);
                    }} 
                    className="w-full bg-slate-800 text-white rounded-2xl py-4 text-base font-black active:scale-95"
                  >
                    사진 없이 운행 완료
                  </button>
                </div>
              )}

              {user.role === 'ADMIN' && d.status === 'pending' && (
                <button onClick={() => onUpdateStatus(d.id, 'sent')} className="w-full bg-blue-600 text-white rounded-2xl py-3 text-sm font-black active:scale-95">기사님께 배차 전송</button>
              )}
            </div>
          );
        })}
      </div>

      {/* 기사님 전용 촬영 및 확인 모달 (UI 개선형) */}
      {cameraOpen && (
        <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-center p-0 md:p-4 animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg h-full md:h-auto md:max-h-[95vh] bg-black rounded-none md:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col">
            
            {/* 상단 액션바 (더 가시성 높은 닫기 버튼) */}
            <div className="absolute top-0 inset-x-0 z-[210] p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
              <button 
                onClick={closeCameraModal} 
                className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 active:scale-90 transition shadow-lg"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
              
              {capturedPhoto && (
                <div className="flex space-x-2">
                  {/* 회전 버튼들 */}
                  <button onClick={() => setRotation(prev => prev - 90)} className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 active:scale-90 transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
                  </button>
                  <button onClick={() => setRotation(prev => prev + 90)} className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 active:scale-90 transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"></path></svg>
                  </button>
                  {/* 확대 버튼 추가 */}
                  <button onClick={() => setZoomScale(prev => prev === 1 ? 2 : 1)} className={`w-12 h-10 rounded-xl flex items-center justify-center text-white border transition-all font-black text-xs ${zoomScale > 1 ? 'bg-blue-600 border-blue-400' : 'bg-black/40 border-white/20'}`}>
                    {zoomScale}x 🔍
                  </button>
                </div>
              )}
            </div>

            {/* 이미지/비디오 프리뷰 영역 (최대한 크게 확보) */}
            <div className={`flex-1 relative bg-slate-900 flex items-center justify-center overflow-auto custom-scrollbar`}>
              {capturedPhoto ? (
                <div 
                  className="w-full h-full flex items-center justify-center p-0 transition-all cursor-move"
                  style={{ minWidth: zoomScale > 1 ? '150%' : '100%', minHeight: zoomScale > 1 ? '150%' : '100%' }}
                >
                  <img 
                    src={capturedPhoto} 
                    style={{ 
                      transform: `rotate(${rotation}deg) scale(${zoomScale})`,
                      transformOrigin: 'center center'
                    }} 
                    className="max-w-full max-h-full object-contain transition-transform duration-300 shadow-2xl" 
                  />
                </div>
              ) : (
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
              )}
              <canvas ref={canvasRef} className="hidden"></canvas>
            </div>

            {/* 하단 입력 및 제어 영역 (버튼 크기 축소하여 사진 공간 확보) */}
            <div className="bg-white dark:bg-slate-900 p-4 space-y-3 shrink-0 border-t border-slate-200 dark:border-slate-800 shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
              {capturedPhoto ? (
                <>
                  <div className="flex flex-col space-y-1.5">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">실수량(t) 입력</label>
                      <span className="text-[10px] font-bold text-blue-500">사진을 확대(🔍)해서 숫자를 확인하세요!</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="number" 
                        inputMode="decimal"
                        autoFocus
                        placeholder="0.00"
                        value={modalQuantity}
                        onChange={(e) => setModalQuantity(e.target.value)}
                        className="flex-1 bg-blue-50 dark:bg-slate-800 border-2 border-blue-600 rounded-xl px-4 py-2 text-xl font-black text-blue-700 dark:text-blue-400 outline-none shadow-inner"
                      />
                      <span className="text-lg font-black text-slate-400">t</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => { setCapturedPhoto(null); setRotation(0); setZoomScale(1); }} 
                      disabled={isProcessingAI}
                      className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-2.5 rounded-xl font-black text-sm active:scale-95 disabled:opacity-50 border border-slate-200 dark:border-slate-700"
                    >
                      다시 찍기
                    </button>
                    <button 
                      onClick={handleFinalSubmit}
                      disabled={isProcessingAI}
                      className="bg-blue-600 text-white py-2.5 rounded-xl font-black shadow-lg shadow-blue-200 active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-50 text-sm"
                    >
                      {isProcessingAI ? (
                         <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                          <span>확인 및 전송</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center space-y-4 py-2">
                  <div className="flex justify-between items-center w-full px-6">
                    <button onClick={closeCameraModal} className="text-slate-500 font-black text-sm py-2">취소</button>
                    <div className="w-20 h-20 relative">
                       <button 
                        onClick={() => {
                          if (videoRef.current && canvasRef.current) {
                            const ctx = canvasRef.current.getContext('2d');
                            canvasRef.current.width = videoRef.current.videoWidth;
                            canvasRef.current.height = videoRef.current.videoHeight;
                            ctx?.drawImage(videoRef.current, 0, 0);
                            setCapturedPhoto(canvasRef.current.toDataURL('image/jpeg'));
                          }
                        }} 
                        className="w-full h-full bg-white rounded-full border-8 border-slate-300 active:scale-90 transition shadow-lg flex items-center justify-center"
                      >
                        <div className="w-12 h-12 rounded-full border-2 border-slate-100"></div>
                      </button>
                    </div>
                    <div className="w-16"></div>
                  </div>
                  <p className="text-slate-400 text-[10px] font-bold">송장 수량이 선명하게 보이도록 촬영하세요.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DispatchManagementView;
