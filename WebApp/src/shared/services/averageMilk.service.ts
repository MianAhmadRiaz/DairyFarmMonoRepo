import api from "../api/AxiosClient";
import { API_CONFIG } from "./apiConfigs";
import { AxiosResponse } from "axios";

export const Averagemilk = (startDate: string, endDate: string): Promise<AxiosResponse> => {
    return (
        api.get(`${API_CONFIG.milk.Averagemilk}/?startDate=${startDate}&endDate=${endDate}`)
    )
}