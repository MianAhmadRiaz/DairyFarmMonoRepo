import api from "../api/AxiosClient";
import { API_CONFIG } from "./apiConfigs";
import { AxiosResponse } from "axios";

export const getRoles = (): Promise<AxiosResponse> => {
   return (
      api.get(API_CONFIG.users.getUser)
   )
}