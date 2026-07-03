import api from '../api/AxiosClient';
import { API_CONFIG } from './apiConfigs';
import { AxiosResponse } from 'axios';

export const MilkDifferenceReport = (
  startDate: string,
  endDate: string
): Promise<AxiosResponse> => {
  return api.get(
    `${API_CONFIG.milk.milkdifferencereport}/?startDate=${startDate}&endDate=${endDate}`
  );
};
