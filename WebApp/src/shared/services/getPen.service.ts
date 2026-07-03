import api from '../api/AxiosClient';
import { API_CONFIG } from './apiConfigs';

export const getPen = () => {
   return api.get(API_CONFIG.pen);
}

export const getPenBasedOnPenId = (penId: string) => {
   return api.get(`${API_CONFIG.pen}?penId=${penId}&all=true`);
};