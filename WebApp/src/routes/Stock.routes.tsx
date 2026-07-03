import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  OpenVoucher,
  StockRegistration,
  ViewRegistration
} from '../scenes/Stock';
import StockDashboard from '../scenes/Stock/StockDashboard';
import FeedingStock from '../scenes/Stock/FeedingStock';
import MedicationStock from '../scenes/Stock/MedicationStock';
import SemenStock from '../scenes/Stock/SemenStock';
import OtherStock from '../scenes/Stock/OtherStock';
import AddStockIssuance from '../scenes/Stock/issuance/AddStockIssuance';
import ViewStockissuance from '../scenes/Stock/issuance/ViewStockissuance';
import Purchases from '../scenes/Stock/Purchases';
import Suppliers from '../scenes/Stock/Suppliers';

const StockRoutes = () => {
  return (
    <Routes>
      <Route path="/stock/dashboard" element={<StockDashboard />} />
      <Route path="/stock/purchases" element={<Purchases />} />
      <Route path="/stock/suppliers" element={<Suppliers />} />
      <Route path="/stock-registration" element={<StockRegistration />} />
      <Route path="/view-registration" element={<ViewRegistration />} />
      <Route path="/open-voucher" element={<OpenVoucher />} />
      <Route path="/feeding-stock" element={<FeedingStock />} />
      <Route path="/medication-stock" element={<MedicationStock />} />
      <Route path="/other-stock" element={<OtherStock />} />
      <Route path="/semen-stock" element={<SemenStock />} />
      <Route
        path="/issuance/add-stock-issuance"
        element={<AddStockIssuance />}
      />
      <Route
        path="/issuance/view-stock-issuance"
        element={<ViewStockissuance />}
      />
    </Routes>
  );
};

export default StockRoutes;
