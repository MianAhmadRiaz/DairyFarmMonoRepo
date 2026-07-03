import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../shared/store';
import { Routes, Route, Navigate } from 'react-router-dom';

import { AuthRoutes } from './Auth.routes';
import DashboardRoutes from './Dashboard.routes';
import SoftwareAdminRoutes from './SoftwareAdmin.routes';
import AfterLogin from '../shared/components/AfterLogin/AfterLogin';
import { usePageTitle } from '../shared/hooks/usePageTitle';
import { setAuthToken, setUser, setSoftwareAdmin } from '../shared/store/userSlice';
import { getCurrentUser } from '../shared/services/auth.services';

const AppRoutes = () => {
  const dispatch = useDispatch();
  const authToken = useSelector((store: RootState) => store.user.authToken);
  const isSoftwareAdmin = useSelector((store: RootState) => store.user.isSoftwareAdmin);

  // Software-admin impersonation: if opened with ?impersonate=<token>, log in
  // AS that farm using the provided token, then strip the param from the URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('impersonate');
    if (token) {
      dispatch(setAuthToken(token));
      dispatch(setUser(null));
      dispatch(setSoftwareAdmin(false));
      params.delete('impersonate');
      const clean =
        window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
      window.history.replaceState({}, '', clean);
    }
  }, [dispatch]);

  // On app load / refresh, re-hydrate the current user (incl. permissions) when a
  // token exists and we're not in the software-admin portal. Defensive: never
  // logs the user out on failure.
  useEffect(() => {
    if (!authToken || isSoftwareAdmin) return;
    let active = true;
    (async () => {
      try {
        const res = await getCurrentUser();
        const freshUser = res?.data?.data;
        if (active && freshUser) {
          dispatch(setUser(freshUser));
        }
      } catch (err) {
        // Ignore — keep the persisted user; 401 handling lives in the axios interceptor.
        console.warn('auth/current re-hydrate failed', err);
      }
    })();
    return () => {
      active = false;
    };
  }, [authToken, isSoftwareAdmin, dispatch]);

  // Dynamic page title based on current route
  usePageTitle();

  return (
    <Routes>
      {!authToken ? (
        // If not authenticated, render the Auth routes
        <>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/*" element={<AuthRoutes />} />
        </>
      ) : isSoftwareAdmin ? (
        // Software owner / super admin portal
        <>
          <Route path="/" element={<Navigate to="/software-admin/dashboard" replace />} />
          <Route path="/*" element={<SoftwareAdminRoutes />} />
        </>
      ) : (
        // If authenticated, first show the RoleSelection screen.
        // Once the role is chosen, you can navigate to DashboardRoutes.
        <>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/after-login" element={<AfterLogin />} />
          <Route path="/*" element={<DashboardRoutes />} />
        </>
      )}
    </Routes>
  );
};

export default AppRoutes;
