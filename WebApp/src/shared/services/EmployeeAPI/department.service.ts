import api from '../../api/AxiosClient';
import { API_CONFIG } from '../apiConfigs';

export interface Department {
  uuid: string;
  name: string;
  description?: string;
  farmId?: string;
  createdAt?: string;
}

export const DepartmentService = {
  getDepartments: async (): Promise<Department[]> => {
    try {
      const response = await api.get(API_CONFIG.department.get);
      return response.data?.data?.departments ?? [];
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
  },

  addDepartment: async (payload: { name: string; description?: string }) => {
    try {
      const response = await api.post(API_CONFIG.department.add, payload);
      return response.data;
    } catch (error) {
      console.error('Error adding department:', error);
      throw error;
    }
  },

  updateDepartment: async (payload: {
    departmentId: string;
    name?: string;
    description?: string;
  }) => {
    try {
      const response = await api.put(API_CONFIG.department.update, payload);
      return response.data;
    } catch (error) {
      console.error('Error updating department:', error);
      throw error;
    }
  },

  deleteDepartment: async (departmentId: string) => {
    try {
      const response = await api.delete(
        `${API_CONFIG.department.delete}?departmentId=${departmentId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting department:', error);
      throw error;
    }
  },
};
