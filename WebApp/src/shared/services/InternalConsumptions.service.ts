import api from "../api/AxiosClient";
import { API_CONFIG } from "./apiConfigs";
import { AxiosResponse } from "axios";

//Get Internal Consumptions
export const getInternalConsumptions = (): Promise<AxiosResponse> => {
    return (
        api.get(API_CONFIG.InternalConsumptions)
    )
}

//Add Internal Consumptions
interface OtherconsumptionsPayload {
    name: string,
}

export const createInternalConsumptions = (data: OtherconsumptionsPayload): Promise<AxiosResponse> => {
    return (
        api.post(`${API_CONFIG.InternalConsumptions}`, data)
    )
}