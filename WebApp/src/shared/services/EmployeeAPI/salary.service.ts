// salary.service.ts
import api from '../../api/AxiosClient';
import { API_CONFIG } from '../apiConfigs';

export interface EmbeddedEmployee {
  uuid: string;
  name: string;
  designation: string;
  department: string;
}

export interface SalaryInvoice {
  invoiceId: string;
  uuid: string;
  pendingAmount: number;
  salaryMonth: string;
  status: string;
  employee: EmbeddedEmployee;
}

interface RawInvoice {
  uuid?: string;
  pendingAmount?: number;
  month?: string;
  status?: string;
  employee?: {
    uuid?: string;
    name?: string;
    designation?: string;
    department?: string;
  };
  employee_id?: string;
  name?: string;
  designation?: string;
  department?: string;
}

interface SalaryInvoiceResponse {
  data?: {
    invoices?: RawInvoice[];
    page?: number;
    totalPages?: number;
    limit?: number;
    skip?: number;
    totalCount?: number;
  };
}


export async function getSalaryInvoices(): Promise<SalaryInvoice[]> {
  try {
    const invoiceRes = await api.get(API_CONFIG.salary.get);
    const invoices: RawInvoice[] = invoiceRes.data?.data?.invoices || [];

 
    const employeeRes = await api.get(API_CONFIG.employee.get);
    const employees = employeeRes.data?.data?.Employees || [];

    return invoices.map((inv: RawInvoice) => {
      const matchedEmp = employees.find((emp: any) => emp.uuid === inv.employee_id);

      const employeeData: EmbeddedEmployee = {
        uuid: inv.employee_id || '',
        name: inv.name || matchedEmp?.name || 'N/A',
        designation: matchedEmp?.designation || 'N/A',
        department: matchedEmp?.department || 'N/A',
      };

      return {
        invoiceId: inv.uuid || '',
        uuid: inv.uuid || '',
        pendingAmount: inv.pendingAmount ?? 0,
        salaryMonth: inv.month || 'N/A',
        status: inv.status || 'unpaid',
        employee: employeeData,
      };
    });
  } catch (error) {
    console.error('Get Salary Invoices Error:', error);
    return [];
  }
}



export async function markInvoicePaid(invoiceId: string): Promise<SalaryInvoice> {
  try {
    const response = await api.put(`${API_CONFIG.salary.markPaid}?invoiceId=${invoiceId}`);
    return response.data?.data?.invoice; 
  } catch (error: any) {
    console.error('Mark Invoice Paid Error:', error);
    throw error;
  }
}

export async function generateSalary(): Promise<any> {
  try {
    const res = await api.post(API_CONFIG.salary.generate);
    return res.data;
  } catch (error) {
    console.error('Generate Salary Error:', error);
    throw error;
  }
}

export async function deleteSalaryInvoice(invoiceId: string): Promise<void> {
  try {
    await api.delete(`${API_CONFIG.salary.delete}?invoiceId=${invoiceId}`);
  } catch (error) {
    console.error('Delete Salary Invoice Error:', error);
    throw error;
  }
}

// generate salary 
export interface SalaryRecord {
  invoiceId: string;
  uuid: string;
  farmId: string;
  employee_id: string;
  name: string;
  expense_head: string;
  month: string;
  date:string;
  gross_salary: number;
  opening_advance: number;
  total_days: number;
  present_days: number;
  absence_days: number;
  salary_days: number;
  deduction: number;
  bonus: number;

}


export async function getSalaryRecords(): Promise<SalaryRecord[]> {
  try {
    const res = await api.get(API_CONFIG.salary.get);
    console.log('API response:', res.data);
    const salaryRecordsArray = res.data?.data?.invoices || [];
    return salaryRecordsArray.map((item: any) => ({
      ...item,
      invoiceId: item.uuid,
    }));
  } catch (error) {
    console.error('Error fetching salary records:', error);
    return [];
  }
}




export async function updateSalaryRecord(record: SalaryRecord): Promise<SalaryRecord> {
  try {
    const response = await api.put(API_CONFIG.salary.update, {
      ...record,
      uuid: record.invoiceId,
    });
    return response.data?.data || record;
  } catch (error: any) {
    console.error('Error updating salary record:', error.response?.data || error.message);
    throw error;
  }
}

export interface GenerateSalaryPayload {
  userId: string;
  employee: {
    uuid: string;
    name: string;
    base_salary: number;
    leave_allowance: number;
  };
  month: string;
  date:string;
  expense_head: string;
  total_days: number;
  present_days: number;
  absence_days: number;
  salary_days: number;
  deduction: number;
  overtime: number;
  bonus: number;
  gross_salary: number;
}


export const generateSalaryRecord = async (payload: GenerateSalaryPayload) => {
  const response = await api.post(API_CONFIG.salary.generate, payload);
  return response.data;
};


// ==================== NEW APIs ====================

// Get employee salaries list with calculations
export interface EmployeeSalaryData {
  employeeId: string;
  name: string;
  designation: string;
  department: string;
  baseSalary: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  deduction: number;
  bonus: number;
  overtime: number;
  grossSalary: number;
  advanceBalance: number;
  netPayable: number;
  status: 'paid' | 'unpaid' | 'partial';
}

export interface GetEmployeeSalariesParams {
  limit?: number;
  page?: number;
  month?: string;
  year?: string;
  department?: string;
  employeeId?: string;
  status?: 'paid' | 'unpaid' | 'all';
}

export async function getEmployeeSalaries(params?: GetEmployeeSalariesParams): Promise<{
  employees: EmployeeSalaryData[];
  summary: {
    totalEmployees: number;
    totalBaseSalary: number;
    totalGrossSalary: number;
    totalDeductions: number;
  };
  pagination: {
    page: number;
    totalPages: number;
    limit: number;
    totalCount: number;
  };
}> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.month) queryParams.append('month', params.month);
    if (params?.year) queryParams.append('year', params.year);
    if (params?.department) queryParams.append('department', params.department);
    if (params?.employeeId) queryParams.append('employeeId', params.employeeId);
    if (params?.status) queryParams.append('status', params.status);

    const url = `${API_CONFIG.salary.get}/employees${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await api.get(url);
    return response.data?.data;
  } catch (error) {
    console.error('Get Employee Salaries Error:', error);
    throw error;
  }
}


// Batch edit employee salaries
export interface BatchEditSalaryItem {
  employeeId: string;
  deduction?: number;
  bonus?: number;
  overtime?: number;
  grossSalary?: number;
  baseSalary?: number;
  presentDays?: number;
  month?: string;
}

export async function batchEditEmployeeSalaries(employees: BatchEditSalaryItem[]): Promise<any> {
  try {
    const response = await api.put(`${API_CONFIG.salary.get}/employees`, { employees });
    return response.data;
  } catch (error) {
    console.error('Batch Edit Employee Salaries Error:', error);
    throw error;
  }
}


// Batch generate salary invoices for all employees
export interface BatchGenerateSalaryParams {
  month: string;
  year: string;
  skipAdvanceDeductionForEmployees?: string[];
  employees?: BatchEditSalaryItem[];
}

export async function batchGenerateSalaries(params: BatchGenerateSalaryParams): Promise<any> {
  try {
    const response = await api.post(`${API_CONFIG.salary.get}/employees/generate`, params);
    return response.data;
  } catch (error) {
    console.error('Batch Generate Salaries Error:', error);
    throw error;
  }
}