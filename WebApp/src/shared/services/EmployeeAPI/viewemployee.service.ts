import api from '../../api/AxiosClient';
import { API_CONFIG } from '../apiConfigs';


export interface GetEmployeeResponse {
  uuid: string;
  name: string;
  father_name: string;
  cnic?: string;
  phone: string;
  city?: string;
  gender?: string;
  dob?: string;
  marital_status?: string;
  designation: string;
  department: string;
  doj: string;
  leave_allow: string | number;
  salary: number;
  acc_no?: string;
  opening_advance?: number;
  address?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeDashboardResponse {
  summary: {
    totalEmployees: number;
    totalSalaryPaidPKR: number;
    currentYearSalaryPaidPKR: number;
    pendingSalariesAmountPKR: number;
    totalAdvanceAmountPKR: number;
    employeesWithPendingSalaries: number;
    employeesWithAdvanceCount: number;
    averageSalaryPerEmployee: number;
  };
  todayAttendance: {
    present: number;
    absent: number;
    onLeave: number;
    notMarked: number;
    attendancePercentage: number;
  };
}

export async function getEmployeeCount(): Promise<number> {
  try {
    const response = await api.get(API_CONFIG.employee.get);
    const employees = response.data?.data?.Employees || []; 
    return employees.length;
  } catch (error: any) {
    console.error('Get Employees Count Error:', error);
    throw error;
  }
}



export async function getAllEmployees(): Promise<GetEmployeeResponse[]> {
  try {
    const response = await api.get(API_CONFIG.employee.get);
    const employees = response.data?.data?.Employees || [];
    return employees;
  } catch (error: any) {
    console.error('Get All Employees Error:', error);
    throw error;
  }
}


export async function deleteEmployee(uuid: string): Promise<void> {
  try {
    await api.delete(`${API_CONFIG.employee.delete}?userId=${uuid}`);
  } catch (error: any) {
    console.error('Error deleting employee:', error);
    throw error;
  }
}


export async function getEmployeeById(employeeId: string): Promise<GetEmployeeResponse> {
  try {
    const response = await api.get(`${API_CONFIG.employee.get}/${employeeId}`);
    return response.data?.data?.user || response.data?.data;
  } catch (error: any) {
    console.error('Get Employee By ID Error:', error);
    throw error;
  }
}


export async function updateEmployee(uuid: string, updatedData: Partial<GetEmployeeResponse>): Promise<void> {
  try {
    await api.put(API_CONFIG.employee.update, { ...updatedData, uuid });
  } catch (error: any) {
    console.error('Error updating employee:', error);
    throw error;
  }
}


export async function getEmployeeDashboard(): Promise<EmployeeDashboardResponse> {
  try {
    const response = await api.get(`${API_CONFIG.employee.get}/dashboard`);
    return response.data?.data;
  } catch (error: any) {
    console.error('Get Employee Dashboard Error:', error);
    throw error;
  }
}
