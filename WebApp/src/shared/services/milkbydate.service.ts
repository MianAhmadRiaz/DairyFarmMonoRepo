import api from "../api/AxiosClient";
import { API_CONFIG } from "./apiConfigs";
import { AxiosResponse } from "axios";

export const getMilkByDate = (date: string): Promise<AxiosResponse> => {
    return (
        api.get(`${API_CONFIG.milk.milkbyDate}/?date=${date}`)
    );
}