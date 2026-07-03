import api from '../api/AxiosClient';
import { API_CONFIG } from './apiConfigs';
import { AxiosResponse } from 'axios';

export const getMilk=()=>{
    return api.get(API_CONFIG.milk.getMilk)
}