import api from "../api/AxiosClient";
import { API_CONFIG } from "./apiConfigs";
import { AxiosResponse } from "axios";

export const cowGraph = (
    startDate: string,
    filterKey?: 'animalId' | 'penId',
    filterValue?: string
): Promise<AxiosResponse> => {
    let url = `${API_CONFIG.milk.graph}?startDate=${startDate}`;

    if (filterKey && filterValue) {
        url += `&${filterKey}=${filterValue}`;
    }
    console.log("Fetching from URL:", url);

    return api.get(url);
};
