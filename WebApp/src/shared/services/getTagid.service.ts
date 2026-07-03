import api from '../api/AxiosClient';
import { API_CONFIG } from './apiConfigs';

export const getTag = () => {
    return (
        api.get(`${API_CONFIG.tag}/?all=${true}}`)
    )
}

export const getTagBasedOnTagId = (tagId: string) => {
    return api.get(`${API_CONFIG.tag}?tagId=${tagId}&all=true`);
};

