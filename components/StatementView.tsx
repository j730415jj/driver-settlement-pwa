
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Operation, Client, UserRole } from '../types';

interface Props {
  title: string;
  type: 'client' | 'vehicle' | 'company';
  operations: Operation[];
  clients: Client[];
  userRole: UserRole;
  userIdentifier: string;
}

const StatementView: React.FC<Props> = ({ title, type, operations, clients, userRole, userIdentifier }) => {
  const [startDate, setStartDate] = useState('2025-12-01');
  const [endDate, setEndDate] = useState('2025-12-31');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const [sidebarWidth, setSidebarWidth] = useState(210);
  const isResizing = useRef(false);

  const startResizing = useCallback(() => {
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = window.innerWidth - e.clientX - 24;
    if (newWidth > 150 && newWidth < 500) {
      setSidebarWidth(newWidth);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  const initialSelectedItem = useMemo(() => {
    if (userRole === 'VEHICLE' && type === 'vehicle') return userIdentifier;
    const list = Array.from(new Set(operations.map(op => type === 'vehicle' ? op.vehicleNo : op.clientName))).filter(Boolean).sort();
    return list[0] || '';
  }, [userRole, userIdentifier, type, operations]);

  const [selectedMain, setSelectedMain] = useState(initialSelectedItem);

  const finalFilteredOps = useMemo(() => {
    return operations.filter(op => {
      const matchDate = op.date >= startDate && op.date <= endDate;
      const matchMain = (type === 'client' || type === 'company') 
        ? op.clientName === selectedMain 
        : op.vehicleNo === selectedMain;
      return matchDate && matchMain;
    });
  }, [operations, type, selectedMain, startDate, endDate]);

  const activeHeaderInfo = useMemo(() => {
    return clients.find(c => c.name === '동현') || clients[0];
  }, [clients]);

  const displayRows = useMemo(() => {
    return finalFilteredOps.map(op => {
      const price = (type === 'client') ? op.clientUnitPrice : op.unitPrice;
      const supply = Math.round(price * op.quantity);
      const tax = Math.round(supply * 0.1);
      const total = supply + tax;
      
      return {
        ...op,
        displayPrice: price,
        displaySupply: supply,
        displayTax: tax,
        displayTotal: total
      };
    });
  }, [finalFilteredOps, type]);

  const totals = displayRows.reduce((acc, row) => ({
    qty: acc.qty + row.quantity,
    supply: acc.supply + row.displaySupply,
    tax: acc.tax + row.displayTax,
    total: acc.total + row.displayTotal
  }), { qty: 0, supply: 0, tax: 0, total: 0 });

  // 차량용 정산 추가 계산 (수수료 5%)
  const commissionBase = Math.round(totals.supply * 0.05);
  const commissionTax = Math.round(commissionBase * 0.1);
  const commissionTotal = commissionBase + commissionTax;
  const netFinalPayout = totals.total - commissionTotal;

  const sidebarList = useMemo(() => {
    const field = (type === 'client' || type === 'company') ? 'clientName' : 'vehicleNo';
    return Array.from(new Set(operations.map(op => op[field]))).filter(Boolean).sort();
  }, [operations, type]);

  const ReportContent = ({ isPreview = false }) => (
    <div className={`bg-white ${isPreview ? 'p-12 md:p-16' : 'p-6 md:p-12'} text-slate-800 w-full overflow-hidden`}>
      <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6">
        <div className="pt-2">
          <h2 className="text-[28px] md:text-[34px] font-black tracking-tighter border-b-[4px] border-slate-900 pb-2 inline-block">
            {title}({type === 'vehicle' ? selectedMain : (selectedMain || activeHeaderInfo?.name)})
          </h2>
        </div>
        
        <div className="w-full md:w-[460px] shrink-0">
          <table className="w-full border-collapse border border-slate-300 text-[11px] leading-snug">
            <tbody>
              <tr>
                <td className="border border-slate-300 bg-slate-50 p-2 text-center font-bold w-24">등록번호</td>
                <td colSpan={3} className="border border-slate-300 p-2 text-center font-black text-[22px] tracking-[0.2em]">{activeHeaderInfo?.regNo || '--- -- -----'}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 bg-slate-50 p-2 text-center font-bold">상 호</td>
                <td className="border border-slate-300 p-2 font-black w-32 text-sm">{activeHeaderInfo?.name}</td>
                <td className="border border-slate-300 bg-slate-50 p-2 text-center font-bold w-16">성 명</td>
                <td className="border border-slate-300 p-2 font-bold text-sm">{activeHeaderInfo?.ceo}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 bg-slate-50 p-2 text-center font-bold">주 소</td>
                <td colSpan={3} className="border border-slate-300 p-2 text-xs">{activeHeaderInfo?.address}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 bg-slate-50 p-2 text-center font-bold">업 태</td>
                <td className="border border-slate-300 p-2 text-xs">{activeHeaderInfo?.businessType}</td>
                <td className="border border-slate-300 bg-slate-50 p-2 text-center font-bold">종 목</td>
                <td className="border border-slate-300 p-2 text-xs">{activeHeaderInfo?.category}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 bg-slate-50 p-2 text-center font-bold">전화번호</td>
                <td className="border border-slate-300 p-2 text-xs font-bold">{activeHeaderInfo?.phone}</td>
                <td className="border border-slate-300 bg-slate-50 p-2 text-center font-bold">팩스번호</td>
                <td className="border border-slate-300 p-2 text-xs font-bold">{activeHeaderInfo?.fax}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-6 pl-1 font-bold text-slate-700 text-sm">
        거래기간 : {startDate.replace(/-/g, '년 ')}일 ~ {endDate.replace(/-/g, '년 ')}일
      </div>

      <div className="overflow-x-auto border border-slate-300 rounded-sm">
        <table className="w-full text-[11px] border-collapse min-w-[1000px]">
          <thead className="bg-slate-50">
            <tr className="divide-x divide-slate-300 border-b border-slate-300">
              <th className="p-2.5 font-bold w-16 text-center">일자</th>
              <th className="p-2.5 font-bold w-24 text-center">차량번호</th>
              {type !== 'vehicle' && <th className="p-2.5 font-bold w-32 text-center">거래처명</th>}
              <th className="p-2.5 font-bold w-28 text-center">상차지</th>
              <th className="p-2.5 font-bold w-28 text-center">하차지</th>
              <th className="p-2.5 font-bold w-24 text-center">품명</th>
              <th className="p-2.5 font-bold w-16 text-center">수량</th>
              <th className="p-2.5 font-bold w-24 text-right">단가</th>
              <th className="p-2.5 font-bold w-28 text-right">공급가액</th>
              <th className="p-2.5 font-bold w-24 text-right">세액</th>
              <th className="p-2.5 font-bold w-32 text-right">합계금액</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
            {displayRows.map(row => (
              <tr key={row.id} className="divide-x divide-slate-300 hover:bg-slate-50/50 transition-colors">
                <td className="p-2 text-center">{row.date.slice(5)}</td>
                <td className="p-2 text-center font-black">{row.vehicleNo}</td>
                {type !== 'vehicle' && <td className="p-2 text-center truncate px-2">{row.clientName}</td>}
                <td className="p-2 text-center truncate px-2">{row.origin}</td>
                <td className="p-2 text-center truncate px-2">{row.destination}</td>
                <td className="p-2 text-center truncate px-2">{row.item}</td>
                <td className="p-2 text-center font-black">{row.quantity.toFixed(2)}</td>
                <td className="p-2 text-right font-bold text-slate-600">{row.displayPrice.toLocaleString()}</td>
                <td className="p-2 text-right font-medium">{row.displaySupply.toLocaleString()}</td>
                <td className="p-2 text-right font-medium">{row.displayTax.toLocaleString()}</td>
                <td className="p-2 text-right font-black bg-slate-50/20">{row.displayTotal.toLocaleString()}</td>
              </tr>
            ))}
            {displayRows.length === 0 && (
              <tr><td colSpan={type === 'vehicle' ? 10 : 11} className="p-24 text-center text-slate-300 italic text-sm">해당 기간의 운행 내역이 존재하지 않습니다.</td></tr>
            )}
          </tbody>
          <tfoot className="border-t-2 border-slate-900">
            {/* 1단계: 총 운행 합계 */}
            <tr className="bg-white font-black text-xs border-b border-slate-200">
              <td colSpan={type === 'vehicle' ? 7 : 8} className="border-r border-slate-300 p-4 text-center text-[11px] text-slate-500 italic">총 운행 합계</td>
              <td className="border-r border-slate-300 p-4 text-right text-slate-700">{totals.supply.toLocaleString()}</td>
              <td className="border-r border-slate-300 p-4 text-right text-slate-700">{totals.tax.toLocaleString()}</td>
              <td className="p-4 text-right text-[12px] bg-slate-50/50">{totals.total.toLocaleString()}</td>
            </tr>

            {/* 2단계: 차량 정산 수수료 (5%) - 차량거래 내역서일 때만 표시 */}
            {type === 'vehicle' && (
              <>
                <tr className="bg-rose-50/30 font-black text-xs border-b border-slate-200">
                  <td colSpan={7} className="border-r border-slate-300 p-4 text-center text-[11px] text-rose-500 italic font-black">공제 수수료 (총공급가 5%)</td>
                  <td className="border-r border-slate-300 p-4 text-right text-rose-600 font-bold">{commissionBase.toLocaleString()}</td>
                  <td className="border-r border-slate-300 p-4 text-right text-rose-600 font-bold">{commissionTax.toLocaleString()}</td>
                  <td className="p-4 text-right text-[12px] text-rose-700 font-black bg-rose-50">-{commissionTotal.toLocaleString()}</td>
                </tr>

                {/* 3단계: 최종 실지급액 */}
                <tr className="bg-blue-600 text-white font-black text-xs">
                  <td colSpan={7} className="border-r border-blue-500 p-5 text-center text-[13px] uppercase tracking-widest">최종 실지급 예정액</td>
                  <td colSpan={2} className="border-r border-blue-500 p-5 text-right text-[11px] opacity-80">합계 - 수수료계 :</td>
                  <td className="p-5 text-right text-xl tracking-tighter shadow-inner bg-blue-700">{netFinalPayout.toLocaleString()}</td>
                </tr>
              </>
            )}

            {/* 거래처용 합계 행 (차량용이 아닐 때만 기존 방식 유지) */}
            {type !== 'vehicle' && (
              <tr className="bg-slate-900 text-white font-black text-xs">
                <td colSpan={8} className="border-r border-slate-700 p-5 text-center text-[12px]">최종 청구액 합계</td>
                <td className="border-r border-slate-700 p-5 text-right">{totals.supply.toLocaleString()}</td>
                <td className="border-r border-slate-700 p-5 text-right">{totals.tax.toLocaleString()}</td>
                <td className="p-5 text-right text-xl">{totals.total.toLocaleString()}</td>
              </tr>
            )}
          </tfoot>
        </table>
      </div>

      <div className="mt-14 p-6 border border-slate-200 bg-slate-50/30 rounded-lg max-w-xl">
        <p className="text-[12px] font-black text-slate-500 mb-2 flex items-center">
          <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
          {type === 'vehicle' ? '차량 정산 안내' : '거래처 정산 안내'}
        </p>
        <p className="text-[11px] text-slate-400 leading-relaxed font-bold">
          {type === 'vehicle' 
            ? '최종 실지급액은 총 운행금액에서 상위 업체 수수료(공급가의 5%) 및 그에 따른 부가세를 공제한 순수령액입니다.'
            : '지급기한 내에 지정된 계좌로 입금 부탁드립니다. 세금계산서 발행 관련 문의는 사무실로 연락 바랍니다.'}
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex h-full w-full gap-0 p-1.5 overflow-hidden">
      <div className="flex-1 overflow-auto bg-slate-200/30 rounded-lg shadow-inner custom-scrollbar pr-1">
        <div className="p-2 w-full">
          <div className="bg-white shadow-md border border-slate-200">
            <ReportContent />
          </div>
        </div>
      </div>

      <div 
        onMouseDown={startResizing}
        className="w-1.5 hover:w-2 bg-transparent hover:bg-blue-400 cursor-col-resize transition-all shrink-0 no-print flex items-center justify-center group z-10"
      >
        <div className="w-[1px] h-20 bg-slate-300 group-hover:bg-blue-300"></div>
      </div>

      <div 
        style={{ width: `${sidebarWidth}px` }} 
        className="space-y-2 no-print shrink-0 flex flex-col h-full ml-1"
      >
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="px-3 py-1.5 bg-slate-800 text-white text-[9px] font-black uppercase tracking-widest text-center">
            조회 설정
          </div>
          <div className="p-3 space-y-2">
            <div className="space-y-0.5">
              <label className="text-[8px] font-black text-slate-400 ml-0.5">시작</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full border border-slate-200 rounded px-2 py-1 text-[10px] font-bold outline-none focus:ring-1 focus:ring-blue-400" />
            </div>
            <div className="space-y-0.5">
              <label className="text-[8px] font-black text-slate-400 ml-0.5">종료</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full border border-slate-200 rounded px-2 py-1 text-[10px] font-bold outline-none focus:ring-1 focus:ring-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex-1 flex flex-col min-h-0">
          <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-black text-slate-800 text-[9px] flex items-center truncate">
              <span className="text-[7px] mr-1 text-blue-500">▼</span>
              {type === 'vehicle' ? '차량' : '거래처'}
            </h3>
            <span className="text-[8px] font-bold text-slate-300 whitespace-nowrap">{sidebarList.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-1 space-y-0.5 bg-slate-50/50">
            {sidebarList.map(item => (
              <button 
                key={item} 
                onClick={() => setSelectedMain(item)}
                className={`w-full text-left px-2 py-1.5 rounded text-[11px] font-black transition-all border truncate ${
                  selectedMain === item 
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm' 
                    : 'bg-white text-slate-600 hover:border-blue-100 hover:text-blue-600 border-transparent'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          <button onClick={() => window.print()} className="bg-slate-900 text-white py-3 rounded-lg font-black flex flex-col items-center justify-center transition-all hover:bg-slate-800 shadow shadow-slate-200 active:scale-95 group">
            <svg className="w-4 h-4 mb-0.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            <span className="text-[9px] uppercase tracking-wider">인쇄하기</span>
          </button>
          
          <button 
            onClick={() => setIsPreviewOpen(true)} 
            className="bg-blue-600 text-white py-3 rounded-lg font-black flex flex-col items-center justify-center transition-all hover:bg-blue-700 shadow shadow-blue-100 active:scale-95 group"
          >
            <svg className="w-4 h-4 mb-0.5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            <span className="text-[9px] uppercase tracking-wider">미리보기</span>
          </button>
        </div>
      </div>

      {isPreviewOpen && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-start overflow-y-auto no-print">
          <div className="sticky top-0 w-full bg-slate-800/80 backdrop-blur border-b border-slate-700 flex items-center justify-between px-6 py-4 z-[1001]">
            <div className="flex items-center space-x-4">
              <span className="text-white font-black text-xl tracking-tighter">리포트 미리보기</span>
              <span className="text-slate-400 text-xs font-bold px-3 py-1 bg-slate-700/50 rounded-full border border-slate-600">
                {title} | {selectedMain}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => window.print()} 
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-black text-sm flex items-center transition shadow-lg shadow-emerald-900/20"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                즉시 인쇄하기
              </button>
              <button 
                onClick={() => setIsPreviewOpen(false)} 
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-xl font-black text-sm flex items-center transition"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                미리보기 닫기
              </button>
            </div>
          </div>

          <div className="max-w-5xl w-full my-12 animate-in zoom-in-95 duration-300 shadow-2xl">
            <div className="bg-white shadow-2xl rounded-sm">
              <ReportContent isPreview={true} />
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
};

export default StatementView;
