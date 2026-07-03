import api from "../api/AxiosClient";
import { API_CONFIG } from "./apiConfigs";
import { AxiosResponse } from "axios";

export const getlistOfMilking = (date: string): Promise<AxiosResponse> => {
    return (
        api.get(`${API_CONFIG.milk.session}/?date=${date}&page=1&limit=100`)
    )
}