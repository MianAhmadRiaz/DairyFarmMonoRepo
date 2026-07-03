import api from "../api/AxiosClient";
import { API_CONFIG } from "./apiConfigs";
import { AxiosResponse } from "axios";

export const milk_out = (startDate: string): Promise<AxiosResponse> => {
    return (
        api.get(`${API_CONFIG.milk.out}?date=${startDate}`)
    )
}


export type MilkOutPayload =
    | {
        remarks?: string;
        outType: string;
        companyId: string;
        date: string;
        volume: number;
        adj_volume?: number;
        pricePerLitre?: number;
        snf?: number;
        fat?: number;
        categoryId?: never;
    }
    | {
        remarks?: string;
        outType: string;
        categoryId: string;
        date: string;
        volume: number;
        adj_volume?: number;
        pricePerLitre?: number;
        snf?: number;
        fat?: number;
        companyId?: never;
    }
    | {
        // suckler / employee / dumped — no company or internal category needed
        remarks?: string;
        outType: string;
        date: string;
        volume: number;
        adj_volume?: number;
        pricePerLitre?: number;
        snf?: number;
        fat?: number;
        companyId?: never;
        categoryId?: never;
    };

export const MilkConsumption = (payload: MilkOutPayload): Promise<AxiosResponse> => {
    return (
        api.post(`${API_CONFIG.milk.out}`, payload)
    )
}