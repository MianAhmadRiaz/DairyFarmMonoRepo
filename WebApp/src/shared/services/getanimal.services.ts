import api from '../api/AxiosClient';
import { API_CONFIG } from './apiConfigs';

export const getanimal=()=>{
    return api.get(API_CONFIG.animal.getanimal)
}