import React from 'react';
import { Route, Routes } from 'react-router-dom';
import ForgotPassword from '../shared/components/Login Screens/ForgotPassword';
import Login from '../shared/components/Login Screens/Login';
import VerifyCode from '../shared/components/Login Screens/VerifyCode';
// Suppose you created a new file for your "Select Role" UI
import AfterLogin from '../shared/components/AfterLogin/AfterLogin';
import SignUp from '../shared/components/Login Screens/SignUp';
import SetNewPassword from '../shared/components/Login Screens/SetNewPassword';
import AdminLogin from '../scenes/SoftwareAdmin/AdminLogin';

export const AuthRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/software-admin/login" element={<AdminLogin />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-code" element={<VerifyCode />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/set-new-password" element={<SetNewPassword />} />

      {/* NEW route for your “Select Role” screen */}
      <Route path="/after-login" element={<AfterLogin />} />

      {/* Catch-all: redirect to login if no match */}
      <Route path="/*" element={<Login />} />
    </Routes>
  );
};
