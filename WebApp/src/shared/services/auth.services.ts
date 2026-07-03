import api from '../api/AxiosClient';
import { API_CONFIG } from './apiConfigs';

export const login = (params: any) => {
  return api.post(API_CONFIG.auth.login, params);
};
export const forgotPassword = (params: any) => {
  return api.post(API_CONFIG.auth.forgetPassword, params);
};
export const register = async (params: any) => {
  try {
    console.log('Sign-up payload:'); // Log payload for debugging

    const response = await api.post(API_CONFIG.auth.signup, params); // API call to /register endpoint

    console.log('Sign-up success:', response.data); // Log response for debugging
    return response.data; // Return the response data
  } catch (error) {
    throw error; // rethrow the error to be handled in the component
  }
};

export const resetPassword = (params: any) => {
  return api.post(API_CONFIG.auth.passwordReset, params);
};

// Refreshes the current user (incl. permissions/isOwner/roleName) for re-hydration.
export const getCurrentUser = () => {
  return api.get(API_CONFIG.auth.current);
};
