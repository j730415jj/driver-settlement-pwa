
export type UserRole = 'ADMIN' | 'VEHICLE';

export enum ViewType {
  DASHBOARD = 'DASHBOARD',
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
  ACCOUNT_MGMT = 'ACCOUNT_MGMT',
  CHANGE_PASSWORD = 'CHANGE_PASSWORD',
  DISPATCH_MGMT = 'DISPATCH_MGMT'
}

export interface AuthUser {
  id: string;
  role: UserRole;
  name: string;
  identifier: string; // 차량번호 또는 아이디
}

export type SettlementStatus = 'PENDING' | 'INVOICED' | 'PAID' | 'FAILED';

export interface AdminAccount {
  id: string;
  name: string;
  username: string;
  password: string;
  createdAt: string;
  lastLogin?: string;
}

export interface UnitPriceMaster {
  id: string;
  clientName: string;
  origin: string;
  destination: string;
  item: string;
  unitPrice: number;       // 차량 단가 (지불용)
  clientUnitPrice: number; // 거래처 단가 (매출용)
}

export interface Snippet {
  id: string;
  keyword: string;     // 호출 키워드
  clientName: string;
  origin: string;
  destination: string;
  item: string;
}

export interface Operation {
  id: string;
  date: string;
  deliveryDate?: string;
  vehicleNo: string;
  clientName: string;
  clientUnitPrice: number; 
  origin: string;
  destination: string;
  itemCode: string;     
  item: string;         
  itemDescription: string; 
  unitPrice: number;    
  quantity: number;
  supplyPrice: number;
  tax: number;
  totalAmount: number;
  invoiceNo?: string;
  isInvoiceIssued?: boolean; 
  remarks?: string;          
  invoicePhoto?: string;     
  settlementStatus: SettlementStatus; 
  isVatIncluded: boolean; 
}

export interface Client {
  id: string;
  name: string;
  regNo: string;
  ceo: string;
  address: string;
  businessType: string;
  category: string;
  phone: string;
  fax: string;
  email: string;
}

export interface Expense {
  id: string;
  date: string;
  category: '유류비' | '정비비' | '기타';
  amount: number;
  description: string;
}

export interface Vehicle {
  id: string;
  vehicleNo: string;
  loginCode: string;
  password?: string;
  ownerName: string;
  phone: string;
  regNo: string;
  address: string;
  lat?: number;
  lng?: number;
  status: 'active' | 'idle' | 'maintenance';
  speed?: number;
  expenses?: Expense[]; // 여러 건의 지출 내역
  // 하위 호환성을 위해 유지 (필요 시 제거 가능)
  fuelCost?: number;
  maintenanceCost?: number;
  otherCost?: number;
}

export interface Dispatch {
  id: string;
  date: string;
  vehicleNo: string;
  clientName: string;
  origin: string;
  destination: string;
  item: string;
  count: number;
  remarks: string;
  status: 'pending' | 'sent' | 'completed';
}

export interface SummaryData {
  clientName: string;
  depositAmount: number;
  payoutAmount: number;
  margin: number;
}
