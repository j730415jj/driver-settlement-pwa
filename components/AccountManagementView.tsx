
import React, { useState } from 'react';
import { Vehicle, AdminAccount } from '../types';

interface Props {
  vehicles: Vehicle[];
  adminAccounts: AdminAccount[];
  onSaveVehicle: (v: Vehicle) => void;
  onDeleteVehicle: (id: string) => void;
  onAddVehicle: (v: Vehicle) => void;
  onAddAdmin: (a: AdminAccount) => void;
  onUpdateAdmin: (a: AdminAccount) => void;
  onDeleteAdmin: (id: string) => void;
}

const AccountManagementView: React.FC<Props> = ({ 
  vehicles, 
  adminAccounts, 
  onSaveVehicle, 
  onDeleteVehicle, 
  onAddVehicle,
  onAddAdmin,
  onUpdateAdmin,
  onDeleteAdmin 
}) => {
  const [activeTab, setActiveTab] = useState<'VEHICLE' | 'ADMIN'>('VEHICLE');
  const [isAdding, setIsAdding] = useState(false);
  const [editingPwId, setEditingPwId] = useState<string | null>(null);
  const [tempPw, setTempPw] = useState('');

  const [vehicleFormData, setVehicleFormData] = useState<Partial<Vehicle>>({
    vehicleNo: '',
    loginCode: '',
    password: '0000'
  });
  
  const [newAdminData, setNewAdminData] = useState<Partial<AdminAccount>>({
    name: '',
    username: '',
    password: ''
  });

  const handleAddNewAdmin = () => {
    if (!newAdminData.name || !newAdminData.username || !newAdminData.password) {
      alert('필수 정보를 모두 입력해주세요.');
      return;
    }
    const newAdmin: AdminAccount = {
      id: `admin-${Date.now()}`,
      name: newAdminData.name || '',
      username: newAdminData.username || '',
      password: newAdminData.password || '',
      createdAt: new Date().toISOString().split('T')[0]
    };
    onAddAdmin(newAdmin);
    setIsAdding(false);
    setNewAdminData({ name: '', username: '', password: '' });
  };

  const handleAddNewVehicle = () => {
    if (!vehicleFormData.vehicleNo || !vehicleFormData.loginCode || !vehicleFormData.password) {
      alert('차량 정보와 비밀번호를 모두 입력해주세요.');
      return;
    }
    const newVehicle: Vehicle = {
      id: `v-${Date.now()}`,
      vehicleNo: vehicleFormData.vehicleNo || '',
      loginCode: vehicleFormData.loginCode || '',
      password: vehicleFormData.password || '',
      ownerName: '',
      phone: '',
      regNo: '',
      address: '',
      status: 'idle'
    };
    onAddVehicle(newVehicle);
    setIsAdding(false);
    setVehicleFormData({ vehicleNo: '', loginCode: '', password: '' });
  };

  const startEditPw = (id: string, currentPw: string) => {
    setEditingPwId(id);
    setTempPw(currentPw);
  };

  const saveEditedPw = (type: 'VEHICLE' | 'ADMIN', id: string) => {
    if (tempPw.length < 4) {
      alert('비밀번호는 최소 4자 이상이어야 합니다.');
      return;
    }

    if (type === 'VEHICLE') {
      const vehicle = vehicles.find(v => v.id === id);
      if (vehicle) {
        onSaveVehicle({ ...vehicle, password: tempPw });
      }
    } else {
      const admin = adminAccounts.find(a => a.id === id);
      if (admin) {
        onUpdateAdmin({ ...admin, password: tempPw });
      }
    }
    setEditingPwId(null);
    setTempPw('');
    alert('비밀번호가 성공적으로 변경되었습니다.');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">계정 및 권한 관리</h2>
          <p className="text-slate-400 text-sm font-medium">관리자 계정 및 차량 로그인 보안 통합 제어 시스템</p>
        </div>
        <button 
          onClick={() => { setIsAdding(!isAdding); setEditingPwId(null); }}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black shadow-xl shadow-slate-200 hover:bg-slate-800 transition flex items-center group"
        >
          <svg className={`w-5 h-5 mr-2 transition-transform duration-300 ${isAdding ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          {isAdding ? '닫기' : `${activeTab === 'VEHICLE' ? '차량' : '관리자'} 계정 추가`}
        </button>
      </div>

      <div className="flex space-x-1 bg-slate-200/50 p-1.5 rounded-2xl w-fit">
        <button 
          onClick={() => { setActiveTab('VEHICLE'); setIsAdding(false); setEditingPwId(null); }}
          className={`px-8 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'VEHICLE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          운행 차량 (기사팀)
        </button>
        <button 
          onClick={() => { setActiveTab('ADMIN'); setIsAdding(false); setEditingPwId(null); }}
          className={`px-8 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'ADMIN' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          시스템 관리 (운영팀)
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 animate-in zoom-in-95 duration-300">
          <h3 className="font-black text-slate-800 mb-6 flex items-center">
            <span className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mr-3">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"></path></svg>
            </span>
            새 {activeTab === 'VEHICLE' ? '차량' : '관리자'} 계정 생성
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeTab === 'VEHICLE' ? (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-wider">Vehicle Number</label>
                  <input 
                    type="text" 
                    placeholder="예: 경북06모 5017"
                    className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 font-bold"
                    value={vehicleFormData.vehicleNo}
                    onChange={e => setVehicleFormData({...vehicleFormData, vehicleNo: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-wider">Login ID (4 Digits)</label>
                  <input 
                    type="text" 
                    placeholder="예: 5017"
                    className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 font-bold"
                    value={vehicleFormData.loginCode}
                    onChange={e => setVehicleFormData({...vehicleFormData, loginCode: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-wider">Password</label>
                  <input 
                    type="password" 
                    placeholder="초기 접속 비밀번호"
                    className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                    value={vehicleFormData.password}
                    onChange={e => setVehicleFormData({...vehicleFormData, password: e.target.value})}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-wider">Name</label>
                  <input 
                    type="text" 
                    placeholder="관리자 성함"
                    className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                    value={newAdminData.name}
                    onChange={e => setNewAdminData({...newAdminData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-wider">Username (ID)</label>
                  <input 
                    type="text" 
                    placeholder="접속 아이디"
                    className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 font-bold text-blue-600"
                    value={newAdminData.username}
                    onChange={e => setNewAdminData({...newAdminData, username: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-wider">Password</label>
                  <input 
                    type="password" 
                    placeholder="비밀번호"
                    className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                    value={newAdminData.password}
                    onChange={e => setNewAdminData({...newAdminData, password: e.target.value})}
                  />
                </div>
              </>
            )}
            <div className="md:col-span-3 flex justify-end mt-4">
              <button 
                onClick={activeTab === 'VEHICLE' ? handleAddNewVehicle : handleAddNewAdmin}
                className="bg-blue-600 text-white px-10 py-3 rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition active:scale-95"
              >
                계정 등록 완료
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] border-b">
            <tr>
              <th className="px-8 py-6">{activeTab === 'VEHICLE' ? '운행 차량' : '시스템 관리자'}</th>
              <th className="px-8 py-6">{activeTab === 'VEHICLE' ? '차주/관리' : '아이디'}</th>
              <th className="px-8 py-6 text-center">접속 정보 및 암호</th>
              <th className="px-8 py-6 text-center">계정 작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {activeTab === 'VEHICLE' ? (
              vehicles.map(v => (
                <tr key={v.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 mr-4 font-black text-[10px]">VEH</div>
                      <span className="font-black text-slate-800">{v.vehicleNo}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-slate-600 font-medium">{v.ownerName || '미지정'}</td>
                  <td className="px-8 py-5 text-center">
                    {editingPwId === v.id ? (
                      <div className="flex items-center justify-center space-x-2">
                        <input 
// 254번 줄 근처 input 태그 수정
<input
  type="text"
  value={tempPw}
  onChange={(e) => setTempPw(e.target.value)}
  className="border-2 border-black text-black font-bold p-1 rounded" // 테두리 진하게, 글자 검정색
  style={{ fontSize: '18px', backgroundColor: 'white', color: 'black' }} // 확실하게 스타일 지정
  autoFocus
/>
                        <button onClick={() => saveEditedPw('VEHICLE', v.id)} className="bg-blue-600 text-white p-1.5 rounded-lg hover:bg-blue-700 transition">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </button>
                        <button onClick={() => setEditingPwId(null)} className="bg-slate-200 text-slate-500 p-1.5 rounded-lg hover:bg-slate-300 transition">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="bg-slate-100 text-slate-500 px-3 py-0.5 rounded-lg text-[10px] font-black mb-1">ID: {v.loginCode}</span>
                        <span className="text-[10px] text-blue-600 font-black cursor-help" onClick={() => startEditPw(v.id, v.password || '')}>PW: ●●●● (변경하기)</span>
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex justify-center space-x-2">
{/* 274번 줄 근처: 기존 버튼 지우고 이걸 넣으세요 */}
<button
  onClick={() => startEditPw(v.id, v.password)}
  className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
  style={{ fontSize: '15px', fontWeight: 'bold', minWidth: '70px' }}
>
  비번변경
</button>                      
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                      </button>
                      <button 
                        onClick={() => { if(window.confirm(`${v.vehicleNo} 차량 계정을 삭제하시겠습니까?`)) onDeleteVehicle(v.id); }} 
                        className="text-slate-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-all"
                        title="계정 삭제"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              adminAccounts.map(a => (
                <tr key={a.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 mr-4">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
                      </div>
                      <span className="font-black text-slate-800">{a.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-indigo-600 font-bold">{a.username}</td>
                  <td className="px-8 py-5 text-center">
                    {editingPwId === a.id ? (
                      <div className="flex items-center justify-center space-x-2">
                        <input 
                          type="text" 
                          value={tempPw} 
                          onChange={e => setTempPw(e.target.value)}
                          className="border border-indigo-300 rounded-lg px-3 py-1 text-xs outline-none focus:ring-2 focus:ring-indigo-200 w-40 font-bold"
                          autoFocus
                        />
                        <button onClick={() => saveEditedPw('ADMIN', a.id)} className="bg-indigo-600 text-white p-1.5 rounded-lg hover:bg-indigo-700 transition">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </button>
                        <button onClick={() => setEditingPwId(null)} className="bg-slate-200 text-slate-500 p-1.5 rounded-lg hover:bg-slate-300 transition">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                      </div>
                    ) : (
                      <span className={`px-4 py-1 rounded-full text-[10px] font-black ${a.id === 'admin-master' ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                        {a.id === 'admin-master' ? 'MASTER ACCOUNT' : 'SYSTEM MANAGER'}
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex justify-center space-x-2">
                       <button 
                        onClick={() => startEditPw(a.id, a.password)}
                        className="text-slate-400 hover:text-indigo-600 p-2 rounded-xl hover:bg-indigo-50 transition-all"
                        title="관리자 비번 수정"
                       >
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                       </button>
                       <button 
                        onClick={() => { 
                          if(a.id === 'admin-master') return alert('마스터 계정은 시스템 보호를 위해 삭제가 제한됩니다.'); 
                          if(window.confirm(`${a.name} 관리자 계정을 영구적으로 삭제하시겠습니까?`)) onDeleteAdmin(a.id); 
                        }} 
                        className={`p-2 rounded-xl transition-all ${a.id === 'admin-master' ? 'text-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
                        disabled={a.id === 'admin-master'}
                        title="관리자 삭제"
                       >
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                       </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row gap-8 items-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center shrink-0 shadow-xl shadow-blue-500/20 relative z-10">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
        </div>
        <div className="relative z-10">
          <h4 className="text-xl font-black mb-3">시스템 보안 거버넌스</h4>
          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl font-medium">
            관리자 대시보드에서는 모든 구성원의 접근 권한을 중앙에서 통제합니다. 
            차량(기사) 계정의 비밀번호가 노출되었거나 분실된 경우, 관리자가 즉시 변경하여 
            데이터 보안을 유지할 수 있습니다. 정기적인 비밀번호 갱신을 통해 자산을 보호하세요.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountManagementView;
