
import { Operation, Client, Vehicle, ViewType, AdminAccount, UnitPriceMaster, Snippet } from './types';

export const MOCK_ADMINS: AdminAccount[] = [
  {
    id: 'admin-master',
    name: '최고관리자',
    username: 'admin',
    password: 'password123',
    createdAt: '2025-01-01'
  }
];

export const MOCK_SNIPPETS: Snippet[] = [
  { id: 'sn1', keyword: '포스코', clientName: '부천', origin: '포항 포스코', destination: '천북부강', item: '습슬러지' },
  { id: 'sn2', keyword: '화순', clientName: '동현', origin: '화순광업소', destination: '경주경동', item: '무연탄' }
];

export const MOCK_UNIT_PRICES: UnitPriceMaster[] = [
  {
    id: 'up1',
    clientName: '부천',
    origin: '포항 포스코',
    destination: '천북부강',
    item: '습슬러지',
    unitPrice: 3500,
    clientUnitPrice: 4000
  },
  {
    id: 'up2',
    clientName: '동현',
    origin: '화순광업소',
    destination: '경주경동',
    item: '무연탄',
    unitPrice: 19000,
    clientUnitPrice: 21000
  }
];

export const MOCK_OPERATIONS: Operation[] = [
  {
    id: '1',
    date: '2025-12-01',
    vehicleNo: '5017',
    clientName: '부천',
    clientUnitPrice: 4000,
    origin: '포항 포스코',
    destination: '천북부강',
    itemCode: 'SLUDGE-001',
    item: '습슬러지',
    itemDescription: '제철소 공정 부산물',
    unitPrice: 3500,
    quantity: 28.29,
    supplyPrice: 99015,
    tax: 9902,
    totalAmount: 108917,
    isInvoiceIssued: true,
    remarks: '특이사항 없음',
    settlementStatus: 'PENDING',
    isVatIncluded: false
  }
];

export const MOCK_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: '동현',
    regNo: '406-81-64763',
    ceo: '장국용',
    address: '포항시 남구 연일읍 새천년대로 202. 2층',
    businessType: '도매및소매업',
    category: '골재',
    phone: '054-285-1300',
    fax: '054-283-1301',
    email: 'donghyun@veraka.co.kr'
  },
  { id: 'c2', name: '부천', regNo: '', ceo: '', address: '', businessType: '', category: '', phone: '', fax: '', email: '' }
];

export const MOCK_VEHICLES: Vehicle[] = [
  { 
    id: 'v1', 
    vehicleNo: '5017', 
    loginCode: '5017',
    password: '5017',
    ownerName: '김철수', 
    phone: '010-1234-5678', 
    regNo: '123-45-67890', 
    address: '경상북도 포항시 남구',
    lat: 36.019, 
    lng: 129.343,
    status: 'active',
    speed: 65,
    fuelCost: 0,
    maintenanceCost: 0,
    otherCost: 0
  }
];

export const NAV_ITEMS = [
  { label: '홈 (대시보드)', value: ViewType.DASHBOARD, category: '목록관리', roles: ['ADMIN', 'VEHICLE'] },
  { label: '배차 관리', value: ViewType.DISPATCH_MGMT, category: '목록관리', roles: ['ADMIN', 'VEHICLE'] },
  { label: '나의 지출 관리', value: ViewType.MASTER_VEHICLE, category: '운행입력', roles: ['VEHICLE'] },
  { label: '거래처 정보', value: ViewType.MASTER_CLIENT, category: '목록관리', roles: ['ADMIN'] },
  { label: '차량 정보', value: ViewType.MASTER_VEHICLE, category: '목록관리', roles: ['ADMIN'] },
  { label: '단가 설정 정보', value: ViewType.MASTER_UNIT_PRICE, category: '목록관리', roles: ['ADMIN'] },
  { label: '배차 스니펫 관리', value: ViewType.MASTER_SNIPPET, category: '목록관리', roles: ['ADMIN'] },
  { label: '계정 관리', value: ViewType.ACCOUNT_MGMT, category: '목록관리', roles: ['ADMIN'] },
  { label: '비밀번호 변경', value: ViewType.CHANGE_PASSWORD, category: '목록관리', roles: ['ADMIN', 'VEHICLE'] },
  { label: '내 차량 실시간 위치', value: ViewType.VEHICLE_TRACKING, category: '목록관리', roles: ['ADMIN', 'VEHICLE'] },
  { label: '운행내역 입력', value: ViewType.OPERATION_ENTRY, category: '운행입력', roles: ['ADMIN'] },
  { label: '차량거래 내역서', value: ViewType.VEHICLE_REPORT, category: '현황관리', roles: ['ADMIN', 'VEHICLE'] },
  { label: '거래처 내역서', value: ViewType.CLIENT_REPORT, category: '현황관리', roles: ['ADMIN'] },
  { label: '상호별 내역서', value: ViewType.COMPANY_REPORT, category: '현황관리', roles: ['ADMIN'] },
  { label: '세금 계산서', value: ViewType.TAX_INVOICE, category: '현황관리', roles: ['ADMIN'] },
  { label: '거래처별 현황', value: ViewType.CLIENT_SUMMARY, category: '현황관리', roles: ['ADMIN'] },
];
