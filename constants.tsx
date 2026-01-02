import { ViewType, Operation, Client, Vehicle, AdminAccount, UnitPriceMaster, Snippet, AuthUser } from './types';

// 왼쪽 사이드바 메뉴 목록 (계정 관리 추가됨)
export const NAV_ITEMS = [
  { label: '배차 관리', value: ViewType.DISPATCH_MGMT, category: '운행관리', roles: ['ADMIN', 'VEHICLE'] },
  { label: '운행일지 기록', value: ViewType.OPERATION_ENTRY, category: '운행관리', roles: ['ADMIN', 'VEHICLE'] },
  { label: '거래처 정보', value: ViewType.CLIENT_SUMMARY, category: '기준정보', roles: ['ADMIN'] },
  { label: '차량 정보', value: ViewType.VEHICLE_TRACKING, category: '기준정보', roles: ['ADMIN'] },
  { label: '단가 설정 정보', value: ViewType.MASTER_UNIT_PRICE, category: '기준정보', roles: ['ADMIN'] },
  { label: '배차 스니펫 관리', value: ViewType.MASTER_SNIPPET, category: '기준정보', roles: ['ADMIN'] },
  { label: '계정 및 권한 관리', value: ViewType.ACCOUNT_MGMT, category: '시스템', roles: ['ADMIN'] }, // ★ 여기 추가됨!
  { label: '비밀번호 변경', value: ViewType.CHANGE_PASSWORD, category: '내 정보', roles: ['ADMIN', 'VEHICLE'] },
];

// 가짜 데이터들 (테스트용)
export const MOCK_OPERATIONS: Operation[] = [];

export const MOCK_CLIENTS: Client[] = [
  { id: 'c1', name: '포항제철소', contact: '054-123-4567', email: 'steel@posco.com', address: '경북 포항시 남구', remarks: '주요 거래처' },
  { id: 'c2', name: '현대제철', contact: '054-987-6543', address: '경북 포항시 북구' },
];

export const MOCK_VEHICLES: Vehicle[] = [
  { id: 'v1', vehicleNo: '경북06모 5017', ownerName: '김철수', phone: '010-1111-2222', loginCode: '5017', password: '0000' },
  { id: 'v2', vehicleNo: '경북06보 5465', ownerName: '미지정', phone: '010-3333-4444', loginCode: '5465', password: '0000' }
];

export const MOCK_ADMINS: AdminAccount[] = [
  { id: 'admin-master', username: 'admin', password: 'password123', name: '총괄 관리자', createdAt: '2024-01-01' },
  { id: 'admin-sub1', username: 'manager', password: 'password123', name: '배차 담당자', createdAt: '2024-02-01' }
];

export const MOCK_UNIT_PRICES: UnitPriceMaster[] = [];
export const MOCK_SNIPPETS: Snippet[] = [];