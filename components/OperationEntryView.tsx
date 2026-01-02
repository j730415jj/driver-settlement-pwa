
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Operation, Vehicle, Client, UnitPriceMaster } from '../types';

interface Props {
  operations: Operation[];
  vehicles: Vehicle[];
  clients: Client[];
  unitPriceMaster: UnitPriceMaster[];
  onAddOperation: (op: Operation) => void;
  onUpdateOperation: (op: Operation) => void;
  onDeleteOperation: (id: string) => void;
}

const OperationEntryView: React.FC<Props> = ({ 
  operations, 
  vehicles, 
  clients, 
  unitPriceMaster,
  onAddOperation, 
  onUpdateOperation, 
  onDeleteOperation 
}) => {
  const [filterDate, setFilterDate] = useState('');
  const [filterVehicle, setFilterVehicle] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [filterOrigin, setFilterOrigin] = useState('');
  const [filterDestination, setFilterDestination] = useState('');
  const [filterRemarks, setFilterRemarks] = useState('');
  const [editTarget, setEditTarget] = useState<Operation | null>(null);
  
  // Viewer States
  const [viewingOp, setViewingOp] = useState<Operation | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const [newEntry, setNewEntry] = useState<Partial<Operation>>({
    date: new Date().toISOString().split('T')[0],
    vehicleNo: '',
    clientName: '',
    clientUnitPrice: 0,
    origin: '',
    destination: '',
    unitPrice: 0,
    item: '',
    quantity: 0,
    remarks: '',
    settlementStatus: 'PENDING',
    isVatIncluded: false,
    isInvoiceIssued: false
  });

  const memory = useMemo(() => {
    return {
      origins: Array.from(new Set(operations.map(op => op.origin))).filter(Boolean).sort(),
      destinations: Array.from(new Set(operations.map(op => op.destination))).filter(Boolean).sort(),
      items: Array.from(new Set(operations.map(op => op.item))).filter(Boolean).sort(),
      vehicles: Array.from(new Set(operations.map(op => op.vehicleNo))).filter(Boolean).sort()
    };
  }, [operations]);

  const calculatePrices = (unitPrice: number, qty: number) => {
    const supplyPrice = Math.round(unitPrice * qty);
    const tax = Math.round(supplyPrice * 0.1);
    const totalAmount = supplyPrice + tax;
    return { supplyPrice, tax, totalAmount };
  };

  const handleNewEntryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'number' ? Number(value) : value;
    setNewEntry(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleAdd = () => {
    if (!newEntry.vehicleNo || !newEntry.clientName) {
      alert('차량번호와 거래처명은 필수입니다.');
      return;
    }
    const { supplyPrice, tax, totalAmount } = calculatePrices(newEntry.unitPrice || 0, newEntry.quantity || 0);
    const op: Operation = {
      ...newEntry as Operation,
      id: Date.now().toString(),
      itemCode: 'AUTO',
      itemDescription: '',
      supplyPrice,
      tax,
      totalAmount,
      isVatIncluded: false,
      isInvoiceIssued: newEntry.isInvoiceIssued || false,
      remarks: newEntry.remarks || ''
    };
    onAddOperation(op);
    setNewEntry(prev => ({ 
      ...prev, 
      quantity: 0, 
      remarks: '',
      isInvoiceIssued: false,
      vehicleNo: prev.vehicleNo,
      clientName: prev.clientName 
    }));
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editTarget) return;
    const { name, value, type } = e.target;
    const finalValue = type === 'number' ? Number(value) : value;
    const updatedTarget = { ...editTarget, [name]: finalValue };
    
    // 단가나 수량이 변경될 때 자동 계산
    if (name === 'unitPrice' || name === 'quantity') {
      const { supplyPrice, tax, totalAmount } = calculatePrices(updatedTarget.unitPrice, updatedTarget.quantity);
      updatedTarget.supplyPrice = supplyPrice;
      updatedTarget.tax = tax;
      updatedTarget.totalAmount = totalAmount;
    }
    setEditTarget(updatedTarget);
  };

  const handleInlineUpdate = () => {
    if (editTarget) {
      onUpdateOperation(editTarget);
      setEditTarget(null);
    }
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditTarget(null);
  };

  const toggleInvoice = (op: Operation) => {
    onUpdateOperation({ ...op, isInvoiceIssued: !op.isInvoiceIssued });
  };

  const filteredOperations = useMemo(() => {
    return operations.filter(op => 
      op.date.includes(filterDate) &&
      op.vehicleNo.toLowerCase().includes(filterVehicle.toLowerCase()) &&
      op.clientName.toLowerCase().includes(filterClient.toLowerCase()) &&
      op.origin.toLowerCase().includes(filterOrigin.toLowerCase()) &&
      op.destination.toLowerCase().includes(filterDestination.toLowerCase()) &&
      (op.remarks || '').toLowerCase().includes(filterRemarks.toLowerCase())
    );
  }, [operations, filterDate, filterVehicle, filterClient, filterOrigin, filterDestination, filterRemarks]);

  const photoOperations = useMemo(() => filteredOperations.filter(op => op.invoicePhoto), [filteredOperations]);

  const colWidths = {
    date: 'w-[90px]',
    vehicle: 'w-[80px]',
    client: 'w-[100px]',
    clientPrice: 'w-[85px]',
    origin: 'w-[110px]',
    dest: 'w-[110px]',
    unitPrice: 'w-[85px]',
    item: 'w-[100px]',
    qty: 'w-[75px]',
    supply: 'w-[100px]',
    tax: 'w-[90px]',
    total: 'w-[110px]',
    photo: 'w-[90px]',
    invoice: 'w-[75px]',
    remarks: 'w-[160px]',
    manage: 'w-[100px]'
  };

  // 뷰어 내 수량 수정 핸들러
  const handleViewerQuantityChange = (newQty: number) => {
    if (!viewingOp) return;
    const { supplyPrice, tax, totalAmount } = calculatePrices(viewingOp.unitPrice, newQty);
    const updated = { ...viewingOp, quantity: newQty, supplyPrice, tax, totalAmount };
    setViewingOp(updated);
    onUpdateOperation(updated);
  };

  const handlePopOut = () => {
    if (!viewingOp?.invoicePhoto) return;
    const width = 800;
    const height = 1000;
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);
    
    const popup = window.open('', '_blank', `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`);
    if (popup) {
      popup.document.write(`
        <html>
          <head>
            <title>송장 미리보기 - ${viewingOp.vehicleNo}</title>
            <style>
              body { margin: 0; background: #0f172a; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; }
              img { max-width: 100%; max-height: 100%; box-shadow: 0 0 50px rgba(0,0,0,0.5); border-radius: 4px; }
              .info { position: fixed; top: 20px; left: 20px; color: white; background: rgba(0,0,0,0.6); padding: 10px 20px; border-radius: 10px; font-size: 14px; backdrop-filter: blur(10px); }
            </style>
          </head>
          <body>
            <div class="info">
              <strong>${viewingOp.vehicleNo}</strong> | ${viewingOp.date}<br/>
              <small>${viewingOp.origin} → ${viewingOp.destination}</small>
            </div>
            <img src="${viewingOp.invoicePhoto}" />
          </body>
        </html>
      `);
      popup.document.close();
    }
  };

  const handleDownload = () => {
    if (!viewingOp?.invoicePhoto) return;
    const link = document.createElement('a');
    link.href = viewingOp.invoicePhoto;
    link.download = `송장_${viewingOp.vehicleNo}_${viewingOp.date}.jpg`;
    link.click();
  };

  const handlePrint = () => {
    if (!viewingOp?.invoicePhoto) return;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`<html><body style="margin:0;display:flex;justify-content:center;align-items:center;"><img src="${viewingOp.invoicePhoto}" style="max-width:100%;max-height:100%;"></body></html>`);
      win.document.close();
      win.focus();
      setTimeout(() => { win.print(); win.close(); }, 500);
    }
  };

  const handleShare = async (op: Operation) => {
    if (!op.invoicePhoto) { alert('공유할 사진이 없습니다.'); return; }
    const title = `[베라카] 송장 - ${op.vehicleNo}`;
    const text = `${op.date} 운행건: ${op.origin} -> ${op.destination} (${op.item})`;
    if (navigator.share) {
      try {
        const arr = op.invoicePhoto.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) { u8arr[n] = bstr.charCodeAt(n); }
        const file = new File([u8arr], `invoice_${op.id}.jpg`, { type: mime });
        await navigator.share({ title, text, files: [file] });
      } catch (err) { }
    } else {
      navigator.clipboard.writeText(text).then(() => alert('송장 정보가 복사되었습니다.'));
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    setZoom(prev => Math.min(Math.max(0.5, prev + delta), 5));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="flex flex-col h-full space-y-3 p-4">
      <datalist id="past-origins">{memory.origins.map(o => <option key={o} value={o} />)}</datalist>
      <datalist id="past-destinations">{memory.destinations.map(d => <option key={d} value={d} />)}</datalist>
      <datalist id="past-items">{memory.items.map(i => <option key={i} value={i} />)}</datalist>
      <datalist id="past-vehicles">{memory.vehicles.map(v => <option key={v} value={v} />)}</datalist>

      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 no-print transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
          {[
            { label: '일자 검색', val: filterDate, set: setFilterDate, ph: 'YYYY-MM-DD' },
            { label: '차량번호', val: filterVehicle, set: setFilterVehicle, ph: '차량번호', list: 'past-vehicles' },
            { label: '거래처명', val: filterClient, set: setFilterClient, ph: '거래처' },
            { label: '상차지 검색', val: filterOrigin, set: setFilterOrigin, ph: '상차지', list: 'past-origins' },
            { label: '하차지 검색', val: filterDestination, set: setFilterDestination, ph: '하차지', list: 'past-destinations' },
            { label: '비고 검색', val: filterRemarks, set: setFilterRemarks, ph: '비고 내용' }
          ].map((f, i) => (
            <div key={i} className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-600 ml-1">{f.label}</label>
              <input type="text" placeholder={f.ph} list={f.list} value={f.val} onChange={e => f.set(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-100" />
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <button onClick={() => setIsGalleryOpen(true)} className="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-xl text-xs font-black transition-all border border-emerald-100 dark:border-emerald-800">
            <span>송장 사진 모아보기 ({photoOperations.length})</span>
          </button>
          <div className="flex space-x-2">
            <button onClick={() => { setFilterDate(''); setFilterVehicle(''); setFilterClient(''); setFilterOrigin(''); setFilterDestination(''); setFilterRemarks(''); }} className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 px-4 py-2 rounded-lg text-xs font-bold transition">초기화</button>
            <button className="bg-[#2563eb] hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-xs font-black shadow-sm">조회하기</button>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-colors">
        <div className="overflow-x-auto overflow-y-auto custom-scrollbar">
          <table className="w-full text-[11px] text-left border-collapse table-fixed min-w-[1750px]">
            <thead className="bg-[#445164] dark:bg-slate-800 text-white sticky top-0 z-20">
              <tr className="divide-x divide-slate-500 dark:divide-slate-700 text-center">
                <th className={`${colWidths.date} px-2 py-3`}>일자</th>
                <th className={`${colWidths.vehicle} px-2 py-3`}>차량번호</th>
                <th className={`${colWidths.client} px-2 py-3`}>거래처명</th>
                <th className={`${colWidths.clientPrice} px-2 py-3`}>거래처 단가</th>
                <th className={`${colWidths.origin} px-2 py-3`}>상차지</th>
                <th className={`${colWidths.dest} px-2 py-3`}>하차지</th>
                <th className={`${colWidths.unitPrice} px-2 py-3`}>차량 단가</th>
                <th className={`${colWidths.item} px-2 py-3`}>품명</th>
                <th className={`${colWidths.qty} px-2 py-3`}>수량</th>
                <th className={`${colWidths.supply} px-2 py-3`}>공급가액</th>
                <th className={`${colWidths.tax} px-2 py-3`}>세액</th>
                <th className={`${colWidths.total} px-2 py-3`}>합계금액</th>
                <th className={`${colWidths.photo} px-2 py-3`}>송장 사진</th>
                <th className={`${colWidths.invoice} px-2 py-3`}>송장상태</th>
                <th className={`${colWidths.remarks} px-2 py-3`}>비고</th>
                <th className={`${colWidths.manage} px-2 py-3`}>관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {/* 신규 등록 행 */}
              <tr className="bg-[#fffceb] dark:bg-slate-900/50 border-b border-slate-300 dark:border-slate-800 divide-x divide-slate-200 dark:divide-slate-800 no-print sticky top-[41px] z-10 shadow-sm">
                <td className="p-1"><input type="date" name="date" value={newEntry.date} onChange={handleNewEntryChange} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-1 py-1 text-xs dark:text-slate-200" /></td>
                <td className="p-1"><input type="text" name="vehicleNo" list="past-vehicles" value={newEntry.vehicleNo} onChange={handleNewEntryChange} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-1 py-1 text-xs text-center font-bold dark:text-slate-100" /></td>
                <td className="p-1">
                  <select name="clientName" value={newEntry.clientName} onChange={handleNewEntryChange} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-0.5 py-1 text-xs font-bold dark:text-slate-100">
                    <option value="">거래처</option>
                    {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </td>
                <td className="p-1"><input type="number" name="clientUnitPrice" value={newEntry.clientUnitPrice} onChange={handleNewEntryChange} className="w-full bg-rose-50 dark:bg-rose-950/20 border-2 border-rose-200 dark:border-rose-900 rounded px-1 py-1 text-xs text-right font-black text-rose-700 dark:text-rose-400" /></td>
                <td className="p-1"><input type="text" name="origin" list="past-origins" value={newEntry.origin} onChange={handleNewEntryChange} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-1 py-1 text-xs text-center dark:text-slate-100" /></td>
                <td className="p-1"><input type="text" name="destination" list="past-destinations" value={newEntry.destination} onChange={handleNewEntryChange} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-1 py-1 text-xs text-center dark:text-slate-100" /></td>
                <td className="p-1"><input type="number" name="unitPrice" value={newEntry.unitPrice} onChange={handleNewEntryChange} className="w-full bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-900 rounded px-1 py-1 text-xs text-right font-black text-blue-700 dark:text-blue-400" /></td>
                <td className="p-1"><input type="text" name="item" list="past-items" value={newEntry.item} onChange={handleNewEntryChange} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-1 py-1 text-xs text-center dark:text-slate-100" /></td>
                <td className="p-1"><input type="number" step="0.01" name="quantity" value={newEntry.quantity} onChange={handleNewEntryChange} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-1 py-1 text-xs font-bold text-center dark:text-slate-100" /></td>
                <td className="p-2 text-slate-400 text-center font-bold">자동</td>
                <td className="p-2 text-slate-400 text-center font-bold">자동</td>
                <td className="p-2 text-slate-400 text-center font-bold">자동</td>
                <td className="p-1 text-center bg-[#fff8d4] dark:bg-slate-800 text-[9px] text-slate-400">배차연동</td>
                <td className="p-1 text-center bg-[#fff8d4] dark:bg-slate-800">
                  <button onClick={() => setNewEntry(prev => ({ ...prev, isInvoiceIssued: !prev.isInvoiceIssued }))} className={`w-7 h-7 rounded-lg border flex items-center justify-center mx-auto ${newEntry.isInvoiceIssued ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-700 text-slate-300'}`}>✔</button>
                </td>
                <td className="p-1 bg-[#fff8d4] dark:bg-slate-800"><input type="text" name="remarks" value={newEntry.remarks} onChange={handleNewEntryChange} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-2 py-1.5 text-xs dark:text-slate-100" /></td>
                <td className="p-1 text-center"><button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white w-full py-1.5 rounded text-xs font-black">등록</button></td>
              </tr>

              {filteredOperations.map((op) => {
                const isEditing = editTarget?.id === op.id;
                return (
                  <tr key={op.id} className={`border-b dark:border-slate-800 transition-colors divide-x divide-slate-100 dark:divide-slate-800 ${isEditing ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`} onClick={() => !isEditing && setEditTarget(op)}>
                    {isEditing ? (
                      /* 인라인 편집 모드 */
                      <>
                        <td className="p-1"><input type="date" name="date" value={editTarget.date} onChange={handleEditChange} className="w-full bg-white dark:bg-slate-800 border border-blue-300 rounded px-1 py-1 text-xs dark:text-slate-200" /></td>
                        <td className="p-1"><input type="text" name="vehicleNo" list="past-vehicles" value={editTarget.vehicleNo} onChange={handleEditChange} className="w-full bg-white dark:bg-slate-800 border border-blue-300 rounded px-1 py-1 text-xs text-center font-bold" /></td>
                        <td className="p-1">
                          <select name="clientName" value={editTarget.clientName} onChange={handleEditChange} className="w-full bg-white dark:bg-slate-800 border border-blue-300 rounded px-0.5 py-1 text-xs font-bold">
                            {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                          </select>
                        </td>
                        <td className="p-1"><input type="number" name="clientUnitPrice" value={editTarget.clientUnitPrice} onChange={handleEditChange} className="w-full bg-white dark:bg-slate-800 border border-blue-300 rounded px-1 py-1 text-xs text-right font-black text-rose-600" /></td>
                        <td className="p-1"><input type="text" name="origin" list="past-origins" value={editTarget.origin} onChange={handleEditChange} className="w-full bg-white dark:bg-slate-800 border border-blue-300 rounded px-1 py-1 text-xs text-center" /></td>
                        <td className="p-1"><input type="text" name="destination" list="past-destinations" value={editTarget.destination} onChange={handleEditChange} className="w-full bg-white dark:bg-slate-800 border border-blue-300 rounded px-1 py-1 text-xs text-center" /></td>
                        <td className="p-1"><input type="number" name="unitPrice" value={editTarget.unitPrice} onChange={handleEditChange} className="w-full bg-white dark:bg-slate-800 border border-blue-300 rounded px-1 py-1 text-xs text-right font-black text-blue-600" /></td>
                        <td className="p-1"><input type="text" name="item" list="past-items" value={editTarget.item} onChange={handleEditChange} className="w-full bg-white dark:bg-slate-800 border border-blue-300 rounded px-1 py-1 text-xs text-center" /></td>
                        <td className="p-1"><input type="number" step="0.01" name="quantity" value={editTarget.quantity} onChange={handleEditChange} className="w-full bg-white dark:bg-slate-800 border border-blue-300 rounded px-1 py-1 text-xs font-black text-center" /></td>
                        <td className="p-2 text-right font-bold text-slate-400">{editTarget.supplyPrice.toLocaleString()}</td>
                        <td className="p-2 text-right font-bold text-slate-400">{editTarget.tax.toLocaleString()}</td>
                        <td className="p-2 text-right font-black text-blue-600">{editTarget.totalAmount.toLocaleString()}</td>
                        <td className="p-1 text-center">
                          {op.invoicePhoto ? <img src={op.invoicePhoto} className="w-8 h-8 rounded border mx-auto" /> : <span className="text-slate-300">없음</span>}
                        </td>
                        <td className="p-1 text-center">
                           <button onClick={(e) => { e.stopPropagation(); setEditTarget({...editTarget, isInvoiceIssued: !editTarget.isInvoiceIssued}) }} className={`w-7 h-7 rounded-lg border flex items-center justify-center mx-auto ${editTarget.isInvoiceIssued ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-700 text-slate-300'}`}>✔</button>
                        </td>
                        <td className="p-1"><input type="text" name="remarks" value={editTarget.remarks} onChange={handleEditChange} className="w-full bg-white dark:bg-slate-800 border border-blue-300 rounded px-2 py-1 text-xs" /></td>
                        <td className="p-1 text-center space-x-1">
                          <button onClick={(e) => { e.stopPropagation(); handleInlineUpdate(); }} className="bg-blue-600 text-white px-2 py-1 rounded text-[10px] font-black">저장</button>
                          <button onClick={handleCancelEdit} className="bg-slate-200 text-slate-600 px-2 py-1 rounded text-[10px] font-black">취수</button>
                        </td>
                      </>
                    ) : (
                      /* 보기 모드 */
                      <>
                        <td className="px-2 py-2.5 text-center text-slate-500 dark:text-slate-400">{op.date.slice(5)}</td>
                        <td className="px-2 py-2.5 text-center font-bold dark:text-slate-200">{op.vehicleNo}</td>
                        <td className="px-2 py-2.5 text-center font-bold text-rose-600 dark:text-rose-400">{op.clientName}</td>
                        <td className="px-2 py-2.5 text-right font-bold text-rose-500 dark:text-rose-400">{op.clientUnitPrice.toLocaleString()}</td>
                        <td className="px-2 py-2.5 text-center truncate dark:text-slate-300">{op.origin}</td>
                        <td className="px-2 py-2.5 text-center truncate dark:text-slate-300">{op.destination}</td>
                        <td className="px-2 py-2.5 text-right font-bold text-blue-600 dark:text-blue-400">{op.unitPrice.toLocaleString()}</td>
                        <td className="px-2 py-2.5 text-center dark:text-slate-300">{op.item}</td>
                        <td className="px-2 py-2.5 text-center font-bold dark:text-slate-300">{op.quantity.toFixed(2)}</td>
                        <td className="px-2 py-2.5 text-right font-bold text-rose-500">{op.supplyPrice.toLocaleString()}</td>
                        <td className="px-2 py-2.5 text-right font-bold text-rose-500">{op.tax.toLocaleString()}</td>
                        <td className="px-2 py-2.5 text-right font-black text-rose-600 dark:text-rose-400">{op.totalAmount.toLocaleString()}</td>
                        <td className="px-2 py-1 text-center" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-center space-x-1.5">
                            {op.invoicePhoto ? (
                              <>
                                <img src={op.invoicePhoto} className="w-8 h-8 rounded border dark:border-slate-700 cursor-pointer hover:scale-110 transition-transform" onClick={() => { setViewingOp(op); setZoom(1); }} />
                                <button onClick={() => handleShare(op)} className="text-blue-500 hover:text-blue-700 text-[10px] font-bold">공유</button>
                              </>
                            ) : <span className="text-slate-300">미등록</span>}
                          </div>
                        </td>
                        <td className="px-1 py-2 text-center" onClick={e => { e.stopPropagation(); toggleInvoice(op); }}>
                          <button className={`w-6 h-6 rounded border ${op.isInvoiceIssued ? 'bg-emerald-500 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-700'}`}>✔</button>
                        </td>
                        <td className="px-2 py-2 truncate text-slate-500 dark:text-slate-400">{op.remarks}</td>
                        <td className="px-2 py-2 text-center">
                          <button onClick={(e) => { e.stopPropagation(); onDeleteOperation(op.id); }} className="text-red-400 hover:text-red-600 font-bold">삭제</button>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Photo Viewer Window */}
      {viewingOp && (
        <div className="fixed inset-0 z-[500] bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-6 select-none animate-in fade-in duration-200" onWheel={handleWheel}>
          <div className="w-full max-w-6xl h-[90vh] bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
            <div className="h-16 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 shrink-0">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg"><svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>
                <div><h3 className="text-slate-800 dark:text-white font-black text-sm tracking-tight">송장 이미지 윈도우</h3><p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{viewingOp.vehicleNo} | {viewingOp.date}</p></div>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={handlePopOut} className="flex items-center space-x-2 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-white px-4 py-2 rounded-xl text-xs font-black transition border border-slate-200 dark:border-slate-600 shadow-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 00-2 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg><span>브라우저 팝업</span></button>
                <button onClick={handleDownload} className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg></button>
                <button onClick={handlePrint} className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg></button>
                <button onClick={() => setViewingOp(null)} className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-black transition-all active:scale-95 shadow-xl ml-4"><span>닫기</span></button>
              </div>
            </div>
            <div className="flex-1 flex overflow-hidden bg-slate-100 dark:bg-slate-950/50">
              <div className="w-72 border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-6 space-y-6 overflow-y-auto hidden md:block">
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">운행 상세 정보</label><div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"><p className="text-blue-600 dark:text-blue-400 font-black text-base">{viewingOp.origin}</p><div className="h-4 border-l-2 border-dotted border-slate-200 dark:border-slate-700 ml-2 my-1"></div><p className="text-emerald-600 dark:text-emerald-400 font-black text-base">{viewingOp.destination}</p></div></div>
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800"><div className="flex justify-between items-center mb-2"><label className="text-[10px] font-black text-blue-500 uppercase">수량 수정 (t)</label></div><input type="number" step="0.01" value={viewingOp.quantity} onChange={(e) => handleViewerQuantityChange(Number(e.target.value))} className="w-full bg-white dark:bg-slate-800 border-2 border-blue-200 dark:border-blue-700 rounded-xl px-4 py-2.5 text-lg font-black text-blue-600 dark:text-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none transition-all" /></div>
                  <div className="space-y-3 px-1">{[{ label: '거래처', val: viewingOp.clientName, color: 'text-rose-500' }, { label: '품명', val: viewingOp.item, color: 'text-slate-700 dark:text-slate-300' }, { label: '단가', val: `₩${viewingOp.unitPrice.toLocaleString()}`, color: 'text-slate-700 dark:text-slate-300' }, { label: '합계금액', val: `₩${viewingOp.totalAmount.toLocaleString()}`, color: 'text-blue-600 dark:text-blue-400 font-black' }].map(item => (<div key={item.label} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2"><span className="text-[10px] font-bold text-slate-400">{item.label}</span><span className={`text-xs font-bold ${item.color}`}>{item.val}</span></div>))}</div>
                </div>
              </div>
              <div className={`flex-1 relative overflow-hidden flex items-center justify-center transition-all ${zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
                <img src={viewingOp.invoicePhoto} style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`, transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} className="max-w-[90%] max-h-[90%] object-contain shadow-2xl pointer-events-none ring-1 ring-black/5 dark:ring-white/10 bg-white" alt="Invoice" />
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white dark:border-slate-700 shadow-2xl space-x-6">
                  <div className="flex items-center space-x-3 pr-6 border-r border-slate-200 dark:border-slate-700">
                    <button onClick={() => setZoom(prev => Math.max(0.5, prev - 0.2))} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 12H4"></path></svg></button>
                    <span className="text-slate-800 dark:text-white font-black text-xs w-10 text-center">{(zoom * 100).toFixed(0)}%</span>
                    <button onClick={() => setZoom(prev => Math.min(5, prev + 0.2))} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg></button>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button onClick={() => setRotation(prev => prev - 90)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg></button>
                    <button onClick={() => setRotation(prev => prev + 90)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"></path></svg></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperationEntryView;
