import api from "../api/AxiosClient";
import { API_CONFIG } from "./apiConfigs";
import { AxiosResponse } from "axios";

export const getCompanies = (): Promise<AxiosResponse> => {
    return (
        api.get(API_CONFIG.company)
    )
}

//Company Interface
interface Comapny {
    "name": string,
    "country": string,
    "arrival_date": Date
}
export const addNewCompany = (data: Comapny): Promise<AxiosResponse> => {
    return (
        api.post(`${API_CONFIG.company}`, data)
    )
}