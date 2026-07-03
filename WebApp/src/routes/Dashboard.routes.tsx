import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../shared/store';

import Topbar from '../shared/components/Topbar/Topbar';
import Sidebar from '../shared/components/Sidebar/Sidebar';
import MainRoutes from './Main.routes';
import MilkingRoutes from './Milking.routes';
import StockRoutes from './Stock.routes';
import FeedingConsumptionRoutes from './FeedingConsumption.routes';
import EmployeeRoutes from './Employee.routes';
import FeedingRoutes from './Feeding.routes';
import FinanceRoutes from './Finance.routes';

const DashboardRoutes = () => {
  const authToken = useSelector((store: RootState) => store.user.authToken);
  return (
    <>
      {authToken && <Topbar />}
      {authToken && <Sidebar />}

      <MainRoutes />
      <MilkingRoutes />
      <StockRoutes />
      <FeedingConsumptionRoutes />
      <EmployeeRoutes />
      <FeedingRoutes />
      <FinanceRoutes />
    </>
  );
};

export default DashboardRoutes;
