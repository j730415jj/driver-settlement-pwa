
import React, { useState, useMemo } from 'react';
import { Client } from '../types';

interface Props {
  clients: Client[];
  onSave: (client: Client) => void;
  onDelete: (id: string) => void;
}

const MasterClientView: React.FC<Props> = ({ clients, onSave, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    ceo: '',
    regNo: '',
    phone: '',
    fax: '',
    email: '',
    address: '',
    businessType: '',
    category: ''
  });

  const filteredClients = useMemo(() => {
    return clients.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ceo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  const handleSelectClient = (client: Client) => {
    setSelectedClientId(client.id);
    setFormData(client);
    setIsEditing(false);
  };

  const handleAddNew = () => {
    setSelectedClientId(null);
    setFormData({
      name: '',
      ceo: '',
      regNo: '',
      phone: '',
      fax: '',
      email: '',
      address: '',
      businessType: '',
      category: ''
    });
    setIsEditing(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('상호명을 입력해주세요.');
      return;
    }
    
    const newClient: Client = {
      ...formData as Client,
      id: selectedClientId || `c${Date.now()}`
    };
    
    onSave(newClient);
    setSelectedClientId(newClient.id);
    setIsEditing(false);
    alert('저장되었습니다.');
  };

  const handleDelete = () => {
    if (selectedClientId && window.confirm('정말 삭제하시겠습니까?')) {
      onDelete(selectedClientId);
      handleAddNew();
    }
  };

  return (
    <div className="flex h-[calc(100vh-180px)] space-x-6">
      {/* Left Pane: Client List */}
      <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-700">거래처 목록</h3>
          <button 
            onClick={handleAddNew}
            className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs px-3 py-1.5 rounded flex items-center transition"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            신규 등록
          </button>
        </div>
        <div className="p-3 border-b border-gray-100">
          <div className="relative">
            <input 
              type="text" 
              placeholder="상호 또는 대표명 검색" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-sm border rounded-lg px-3 py-2 pl-9 outline-none focus:ring-1 focus:ring-blue-500"
            />
            <svg className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredClients.map(client => (
            <button
              key={client.id}
              onClick={() => handleSelectClient(client)}
              className={`w-full text-left p-4 border-b border-gray-50 transition-colors hover:bg-blue-50 ${selectedClientId === client.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}
            >
              <div className="font-bold text-gray-800">{client.name}</div>
              <div className="text-xs text-gray-500 mt-1 flex justify-between">
                <span>대표: {client.ceo || '-'}</span>
                <span>{client.phone || '-'}</span>
              </div>
            </button>
          ))}
          {filteredClients.length === 0 && (
            <div className="p-10 text-center text-gray-400 text-sm">검색 결과가 없습니다.</div>
          )}
        </div>
      </div>

      {/* Right Pane: Detail/Edit Form */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-700">
            {selectedClientId ? '거래처 정보 수정' : '신규 거래처 등록'}
          </h3>
          {selectedClientId && !isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="bg-blue-100 text-blue-700 text-xs px-4 py-1.5 rounded-lg font-bold hover:bg-blue-200 transition"
            >
              상세 수정
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex-1 p-8 overflow-y-auto">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500">상호명 (필수)</label>
              <input 
                type="text" 
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                disabled={!isEditing && !!selectedClientId}
                placeholder="상호명을 입력하세요"
                className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-gray-50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500">대표자 이름</label>
              <input 
                type="text" 
                name="ceo"
                value={formData.ceo || ''}
                onChange={handleInputChange}
                disabled={!isEditing && !!selectedClientId}
                placeholder="대표자명을 입력하세요"
                className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-gray-50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500">사업자 등록번호</label>
              <input 
                type="text" 
                name="regNo"
                value={formData.regNo || ''}
                onChange={handleInputChange}
                disabled={!isEditing && !!selectedClientId}
                placeholder="000-00-00000"
                className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-gray-50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500">전화번호</label>
              <input 
                type="text" 
                name="phone"
                value={formData.phone || ''}
                onChange={handleInputChange}
                disabled={!isEditing && !!selectedClientId}
                placeholder="000-000-0000"
                className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-gray-50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500">팩스번호</label>
              <input 
                type="text" 
                name="fax"
                value={formData.fax || ''}
                onChange={handleInputChange}
                disabled={!isEditing && !!selectedClientId}
                placeholder="000-000-0000"
                className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-gray-50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500">이메일 주소</label>
              <input 
                type="email" 
                name="email"
                value={formData.email || ''}
                onChange={handleInputChange}
                disabled={!isEditing && !!selectedClientId}
                placeholder="example@email.com"
                className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-gray-50"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-bold text-gray-500">주소</label>
              <input 
                type="text" 
                name="address"
                value={formData.address || ''}
                onChange={handleInputChange}
                disabled={!isEditing && !!selectedClientId}
                placeholder="도로명 주소 또는 지번 주소를 입력하세요"
                className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-gray-50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500">업태</label>
              <input 
                type="text" 
                name="businessType"
                value={formData.businessType || ''}
                onChange={handleInputChange}
                disabled={!isEditing && !!selectedClientId}
                placeholder="예: 제조업"
                className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-gray-50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500">종목</label>
              <input 
                type="text" 
                name="category"
                value={formData.category || ''}
                onChange={handleInputChange}
                disabled={!isEditing && !!selectedClientId}
                placeholder="예: 골재, 물류"
                className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-gray-50"
              />
            </div>
          </div>

          <div className="mt-12 flex items-center justify-between border-t pt-8">
            <div>
              {selectedClientId && (
                <button 
                  type="button"
                  onClick={handleDelete}
                  className="bg-red-50 text-red-600 px-6 py-2.5 rounded-xl font-bold hover:bg-red-100 transition flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  삭제하기
                </button>
              )}
            </div>
            <div className="flex space-x-3">
              {(isEditing || !selectedClientId) && (
                <>
                  <button 
                    type="button"
                    onClick={() => {
                      if(selectedClientId) {
                        handleSelectClient(clients.find(c => c.id === selectedClientId)!);
                      } else {
                        handleAddNew();
                      }
                    }}
                    className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition"
                  >
                    취소
                  </button>
                  <button 
                    type="submit"
                    className="bg-blue-600 text-white px-10 py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-md transition flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    정보 저장
                  </button>
                </>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MasterClientView;
