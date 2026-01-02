// 공통 타입 정의 (사전)

// 화면 종류
export enum ViewType {
  DASHBOARD = 'DASHBOARD',
  DISPATCH_MGMT = 'DISPATCH_MGMT',
  OPERATION_ENTRY = 'OPERATION_ENTRY',
  CLIENT_SUMMARY = 'CLIENT_SUMMARY',
  CLIENT_REPORT = 'CLIENT_REPORT',
  VEHICLE_REPORT = 'VEHICLE_REPORT',
  COMPANY_REPORT = 'COMPANY_REPORT',
  TAX_INVOICE = 'TAX_INVOICE',
  MASTER_CLIENT = 'MASTER_CLIENT',
  MASTER_VEHICLE = 'MASTER_VEHICLE',
  MASTER_UNIT_PRICE = 'MASTER_UNIT_PRICE',
  MASTER_SNIPPET = 'MASTER_SNIPPET',
  VEHICLE_TRACKING = 'VEHICLE_TRACKING',
  CHANGE_PASSWORD = 'CHANGE_PASSWORD',
  ACCOUNT_MGMT = 'ACCOUNT_MGMT' // 계정 관리 화면 추가됨
}

// 사용자 정보 (로그인한 사람)
export interface AuthUser {
  id: string;
  role: 'ADMIN' | 'VEHICLE';
  name: string;
  identifier: string;
}

// 관리자 계정 (비밀번호 포함)
export interface AdminAccount {
  id: string;
  username: string;
  password?: string; // 비밀번호 추가됨
  name: string;
  createdAt: string;
}

// 차량 정보 (비밀번호, 로그인코드 포함)
export interface Vehicle {
  id: string;
  vehicleNo: string;
  ownerName: string;
  phone: string;
  regNo?: string;
  address?: string;
  status?: string;
  loginCode: string; // 로그인용 간편 코드
  password?: string; // 비밀번호 추가됨
}

// 거래처 정보
export interface Client {
  id: string;
  name: string;
  businessNo?: string;
  owner?: string;
  contact?: string;
  email?: string;
  address?: string;
  remarks?: string;
}

// 운행 내역 (배차 연동 포함)
export interface Operation {
  id: string;
  date: string;
  vehicleNo: string;
  clientName: string;
  clientUnitPrice: number;
  origin: string;
  destination: string;
  itemCode: string;
  item: string;
  itemDescription?: string;
  unitPrice: number;
  quantity: number;
  supplyPrice: number;
  tax: number;
  totalAmount: number;
  settlementStatus: 'PENDING' | 'COMPLETED';
  isVatIncluded: boolean;
  invoicePhoto?: string;
  remarks?: string;
}

// 배차 내역
export interface Dispatch {
  id: string;
  date: string;
  vehicleNo: string;
  clientName: string;
  origin: string;
  destination: string;
  item: string;
  status: 'pending' | 'sent' | 'completed';
}

// 단가표 관리
export interface UnitPriceMaster {
  id: string;
  origin: string;
  destination: string;
  item: string;
  unitPrice: number;
  clientUnitPrice: number;
}

// 자동완성 문구 (스니펫)
export interface Snippet {
  id: string;
  keyword: string;
  clientName: string;
  origin: string;
  destination: string;
  item: string;
}