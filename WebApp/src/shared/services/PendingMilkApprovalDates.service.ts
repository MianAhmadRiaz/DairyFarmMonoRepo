import api from '../api/AxiosClient';
import { API_CONFIG } from './apiConfigs';
import { AxiosResponse } from 'axios';


export const GetPendingApprovalDates = (): Promise<AxiosResponse> => {
    const today = new Date().toISOString().split('T')[0]; // Format: yyyy-mm-dd
    const daysToCheck = 30;

    return api.get(API_CONFIG.milk.PendingApprovalMilkDates, {
        params: {
            date: today,
            daysToCheck,
        },
    });
}