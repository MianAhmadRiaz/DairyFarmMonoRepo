import HTTP_CLIENT from 'shared/utils/Axios_Client';
import API_CONFIG from '../../../cattle.config';

import axios from 'axios';
import {LOGIN_ENUM} from 'shared/utils/models/enums';
import i18n from 'shared/i18n';
import {handleNotification} from './helper.services';

const login = async (params: LOGIN_ENUM) => {
  return await HTTP_CLIENT.post(API_CONFIG.AUTH.login, params);
};

// Re-hydrates the current user (incl. permissions) — used on app resume.
const getCurrentUser = async () => {
  return await HTTP_CLIENT.get(API_CONFIG.AUTH.current);
};

// First-login: set a new password to clear the temporary one.
const setPassword = async (params: {
  currentPassword: string;
  password: string;
  confirmpassword: string;
}) => {
  return await HTTP_CLIENT.post(API_CONFIG.AUTH.setPassword, params);
};
export const handleValidation = (values: any) => {
  const validationRules = [
    {
      field: 'name',
      condition: !values.name.trim(),
      context: 'validation_name',
      message: i18n.t('services.validation.nameRequired'),
    },
    {
      field: 'email',
      condition: !values.email.trim(),
      context: 'validation_email',
      message: i18n.t('services.validation.emailRequired'),
    },
    {
      field: 'password',
      condition: !values.password.trim(),
      context: 'validation_password',
      message: i18n.t('services.validation.passwordRequired'),
    },
    {
      field: 'confirmPassword',
      condition: values.password !== values.confirmPassword,
      context: 'validation_confirmPassword',
      message: i18n.t('services.validation.passwordsMismatch'),
    },
  ];

  for (const rule of validationRules) {
    if (rule.condition) {
      handleNotification('error', rule.context, rule.message);
      return false; // Stop further validation
    }
  }

  return true; // All validations passed
};

const register = async (formData: any) => {
  console.log('formData inside', formData);

  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };
  const response = await axios.post(
    // API_CONFIG.BASE_URL + API_CONFIG.AUTH.register + `/${id}/update`,
    formData,
  );

  console.log('resp', response);
  return response;
};

const forgotPassword = async (params: any) => {
  return await HTTP_CLIENT.post(API_CONFIG.AUTH.verifyOtp, params);
};
const otpVerify = async (params: any) => {
  return await HTTP_CLIENT.post(API_CONFIG.AUTH.verifyOtp, params);
};
const resendOTP = async (params: any) => {
  return await HTTP_CLIENT.post(API_CONFIG.AUTH.resendOTP, params);
};
const logout = async () => {
  return await HTTP_CLIENT.post(API_CONFIG.AUTH.logout);
};

export {
  login,
  getCurrentUser,
  setPassword,
  forgotPassword,
  logout,
  otpVerify,
  register,
  resendOTP,
};
