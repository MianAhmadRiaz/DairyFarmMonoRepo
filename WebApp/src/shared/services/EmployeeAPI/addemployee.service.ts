//  ============================
//  Add New Employee API Service
//  ============================



import api from '../../api/AxiosClient';
import { API_CONFIG } from '../apiConfigs';

export interface EmployeeData {
  name: string;
  father_name: string;
  cnic: string;
  phone: string;
  city: string;
  gender: string;
  dob: string;
  marital_status: string;
  designation: string;
  department: string;
  doj: string;
    leave_allow: string | number;       
   salary: string | number;           
  acc_no: string;
  opening_advance: string | number;
  address: string;
}

export async function addNewEmployee(data: EmployeeData): Promise<any> {
  try {
    const response = await api.post(API_CONFIG.employee.add, data);
    return response.data;
  } catch (error: any) {
    console.error('Add Employee Error:', error);
    throw error;
  }
}


