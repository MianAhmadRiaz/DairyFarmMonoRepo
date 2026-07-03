import api from "../api/AxiosClient";
import { API_CONFIG } from "./apiConfigs";
import { AxiosResponse } from "axios";

export const milk_analytics = (startDate: string): Promise<AxiosResponse> => {
    return (
        api.get(`${API_CONFIG.milk.analytics}?date=${startDate}`)
    )
}