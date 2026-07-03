import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import AdminLayout from '../scenes/SoftwareAdmin/AdminLayout';
import Dashboard from '../scenes/SoftwareAdmin/Dashboard';
import Farms from '../scenes/SoftwareAdmin/Farms';
import Plans from '../scenes/SoftwareAdmin/Plans';
import Subscriptions from '../scenes/SoftwareAdmin/Subscriptions';
import Payments from '../scenes/SoftwareAdmin/Payments';
import Revenue from '../scenes/SoftwareAdmin/Revenue';
import AuditLogs from '../scenes/SoftwareAdmin/AuditLogs';

const SoftwareAdminRoutes = () => {
  return (
    <Routes>
      <Route path="/software-admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/software-admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="farms" element={<Farms />} />
        <Route path="plans" element={<Plans />} />
        <Route path="subscriptions" element={<Subscriptions />} />
        <Route path="payments" element={<Payments />} />
        <Route path="revenue" element={<Revenue />} />
        <Route path="audit-logs" element={<AuditLogs />} />
      </Route>
      <Route path="*" element={<Navigate to="/software-admin/dashboard" replace />} />
    </Routes>
  );
};

export default SoftwareAdminRoutes;
