export type ContractType = 'full-time' | 'part-time' | 'internship';

export interface Contract {
  id: string;
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  contractType: ContractType;
  status: 'active' | 'expired' | 'expiring-soon';
  createdAt: string;
  createdBy: string;
}

export interface ContractFormData {
  employeeId: string;
  startDate: string;
  endDate: string;
  contractType: ContractType;
}
