import api from '../api/AxiosClient';
import { API_CONFIG } from './apiConfigs';
import { AxiosResponse } from 'axios';


// Get approved Milk
export const getApprovedMilk = (start: string): Promise<AxiosResponse> => {
    return (
        api.get(`${API_CONFIG.milk.ApprovedMilk}/?date=${start}`)
    )
}

//Post request to approve Milk
interface MilkingSession {
    milkingTime: string;
    milk: number;
}

interface SessionData {
    uuid: string;
    name: string;
    penId: string;
    tagId: string;
    lactation: number;
    date: string;
    sessions: MilkingSession[];
}

interface Payload {
    sessionsData: SessionData[];
}

export const ApproveMilkSession = (payload: Payload): Promise<AxiosResponse> => {
    return (
        api.post(API_CONFIG.milk.ApprovedMilk, payload)
    );
}