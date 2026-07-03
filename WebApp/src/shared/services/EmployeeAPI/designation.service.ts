import api from '../../api/AxiosClient';
import { API_CONFIG } from '../apiConfigs';

export interface Designation {
  uuid: string;
  name: string;
  description?: string;
  farmId?: string;
  createdAt?: string;
}

export const DesignationService = {
  getDesignations: async (): Promise<Designation[]> => {
    try {
      const response = await api.get(API_CONFIG.designation.get);
      return response.data?.data?.designations ?? [];
    } catch (error) {
      console.error('Error fetching designations:', error);
      throw error;
    }
  },

  addDesignation: async (payload: { name: string; description?: string }) => {
    try {
      const response = await api.post(API_CONFIG.designation.add, payload);
      return response.data;
    } catch (error) {
      console.error('Error adding designation:', error);
      throw error;
    }
  },

  updateDesignation: async (payload: {
    designationId: string;
    name?: string;
    description?: string;
  }) => {
    try {
      const response = await api.put(API_CONFIG.designation.update, payload);
      return response.data;
    } catch (error) {
      console.error('Error updating designation:', error);
      throw error;
    }
  },

  deleteDesignation: async (designationId: string) => {
    try {
      const response = await api.delete(
        `${API_CONFIG.designation.delete}?designationId=${designationId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting designation:', error);
      throw error;
    }
  },
};
