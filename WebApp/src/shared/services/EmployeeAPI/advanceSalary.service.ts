import api from '../../api/AxiosClient';
import { API_CONFIG } from '../apiConfigs';

// ------------------- Interfaces -------------------
export interface Employee {
  uuid: string;
  name: string;
  acc_no: string;
  salary: number;
  leave_allow: number;
  department: string;
  designation: string;
}

export interface AddAdvancePayload {
  userId: string;
  date: string;
  account: string;
  naration: string;
  amount: number;
}

export interface UpdateAdvancePayload {
  uuid: string;
  farmId: string;
  employee_id: string;
  date: string;
  amount: number;
  account: string;
  naration: string;
}

// ------------------- Service -------------------
export const AdvanceSalaryService = {
  getEmployees: async (): Promise<Employee[]> => {
    try {
      const response = await api.get(API_CONFIG.employee.get);
      return response.data.data.Employees;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  },

  addAdvanceSalary: async (payload: AddAdvancePayload) => {
    try {
      const response = await api.post(API_CONFIG.salary.addAdvance, payload);
      return response.data;
    } catch (error) {
      console.error('Error adding advance salary:', error);
      throw error;
    }
  },

  getAdvanceSalaries: async (employeeId?: string) => {
    try {
      const url = employeeId
        ? `${API_CONFIG.salary.getAdvance}?employeeId=${employeeId}`
        : API_CONFIG.salary.getAdvance;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching advance salaries:', error);
      throw error;
    }
  },

  updateAdvanceSalary: async (payload: UpdateAdvancePayload) => {
    try {
      const response = await api.put(API_CONFIG.salary.updateAdvance, payload);
      return response.data;
    } catch (error) {
      console.error('Error updating advance salary:', error);
      throw error;
    }
  },

  // Give advance to employee
  giveAdvanceToEmployee: async (payload: {
    employeeId: string,
    amount: number,
    date: string,
    paymentMethod?: string,
    remarks?: string
  }) => {
    try {
      const response = await api.post(
        API_CONFIG.salary.giveAdvance,
        {
          employeeId: payload.employeeId,
          amount: payload.amount,
          transaction_date: payload.date,
          payment_method: payload.paymentMethod || 'cash',
          description: payload.remarks
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error giving advance to employee:', error);
      throw error;
    }
  },

  // Receive advance from employee (deduction)
  receiveAdvanceFromEmployee: async (payload: {
    employeeId: string,
    amount: number,
    date: string,
    paymentMethod?: string,
    remarks?: string
  }) => {
    try {
      const response = await api.post(
        API_CONFIG.salary.receiveAdvance,
        {
          employeeId: payload.employeeId,
          amount: payload.amount,
          transaction_date: payload.date,
          payment_method: payload.paymentMethod || 'cash',
          description: payload.remarks
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error receiving advance from employee:', error);
      throw error;
    }
  },

  // Get advance transaction history
  getAdvanceTransactionHistory: async (params?: {
    employeeId?: string,
    startDate?: string,
    endDate?: string,
    transactionType?: 'give' | 'receive',
    paymentMethod?: string,
    status?: 'active' | 'fully_recovered' | 'written_off' | 'all'
  }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.employeeId)
        queryParams.append('employeeId', params.employeeId);
      if (params?.startDate) queryParams.append('start_date', params.startDate);
      if (params?.endDate) queryParams.append('end_date', params.endDate);
      if (params?.transactionType)
        queryParams.append('transaction_type', params.transactionType);
      if (params?.paymentMethod)
        queryParams.append('payment_method', params.paymentMethod);
      if (params?.status) queryParams.append('status', params.status);

      const url = `${API_CONFIG.salary.advanceHistory}${
        queryParams.toString() ? '?' + queryParams.toString() : ''
      }`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching advance transaction history:', error);
      throw error;
    }
  }
};
