import api from '../api/AxiosClient';
import { API_CONFIG } from './apiConfigs';
import { AxiosResponse } from 'axios';


// Create Milking Session
interface MilkingSessionData {
    animalId: string,
    tagUser?: string | null,
    date: string,
    milk: number,
    milkingTime: string,
    remarks: string | null,
}
export const createMilkingSession = (data: MilkingSessionData): Promise<AxiosResponse> => {
    return (
        api.post(`${API_CONFIG.milk.session}`, data)
    )
}


//Update Milking Session
interface MilkSessionUpdatePayload {
    animalId: string;
    date: string;
    milk: number;
    milkingTime: string;
}

export const updateMilkSession = async (
    payload: MilkSessionUpdatePayload
): Promise<AxiosResponse<any>> => {
    try {
        const response = await api.put(
            `${API_CONFIG.milk.session}`,
            payload
        );
        return response;
    } catch (error) {
        console.error("Failed to update milk session:", error);
        throw error;
    }
};
