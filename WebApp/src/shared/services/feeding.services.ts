import api from '../api/AxiosClient';
import { API_CONFIG } from './apiConfigs';

export interface FeedingConsumption {
  uuid: string;
  name: string;
  description: string;
  items: {
    itemId: string,
    quantity: number
  }[];
  autoFeedDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface FeedingConsumptionResponse {
  data: {
    items: FeedingConsumption[],
    page: number,
    totalPages: number,
    limit: number,
    skip: number,
    totalCount: number
  };
}

export interface FeedingConsumptionRequest {
  name: string;
  description: string;
  items: {
    itemId: string,
    quantity: number
  }[];
  autoFeedDays: number;
}

export interface DayWiseConsumptionResponse {
  statusCode: number;
  success: boolean;
  message: string;
  type: string;
  data: {
    items: {
      itemId: string,
      day: string,
      total_quantity: string,
      'item.name': string
    }[],
    count: number
  };
}

export const addFeedingConsumption = (data: FeedingConsumptionRequest) => {
  return api.post(API_CONFIG.feeding.addFeedingConsumption, data);
};

export const addMedicineConsumption = (data: FeedingConsumptionRequest) => {
  return api.post(API_CONFIG.feeding.addMultipleConsumption, data);
};
export const fetchFeedingConsumptions = (
  page: number,
  limit: number,
  search?: string,
  startDate?: string,
  endDate?: string
) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate })
  });

  return api.get(`${API_CONFIG.feeding.getFeedingConsumptions}?${params}`);
};

export const fetchConsumptionReport = (
  page: number,
  limit: number,
  search?: string,
  startDate?: string,
  endDate?: string
) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate })
  });

  return api.get(`${API_CONFIG.feeding.getConsumptionReport}?${params}`);
};

export const fetchFeedCostAnalysis = async (
  startDate: string,
  endDate: string,
  categoryId?: string
) => {
  const params = new URLSearchParams({
    startDate: startDate.toString(),
    endDate: endDate.toString(),
    ...(categoryId && { categoryId })
  });

  return api.get(`${API_CONFIG.stock.feedCost}?${params}`);
};

export const fetchDayWiseConsumption = async (
  startDate: string,
  endDate?: string
): Promise<DayWiseConsumptionResponse> => {
  try {
    const url = `${
      API_CONFIG.feeding.getDayWiseConsumption
    }?startDate=${startDate}${endDate ? `&endDate=${endDate}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error in fetchDayWiseConsumption:', error);
    throw error;
  }
};
