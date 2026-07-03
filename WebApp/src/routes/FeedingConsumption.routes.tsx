import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AddFeedingConsumption from '../scenes/Stock/consumption/FeedingConsumption/AddFeedingConsumption';
import DayWiseConsumeReport from '../scenes/Stock/consumption/FeedingConsumption/DayWiseConsumeReport';
import FeedCostAnalysis from '../scenes/Stock/consumption/FeedingConsumption/FeedCostAnalysis';
import ViewFeedingConsumption from '../scenes/Stock/consumption/FeedingConsumption/ViewFeedingConsumption';
import MedicineSummary from '../scenes/Stock/reports/MedicineSummary';
import FeedingSummary from '../scenes/Stock/reports/FeedingSummary';
import SemenSummary from '../scenes/Stock/reports/SemenSummary';
import OtherStockSummary from '../scenes/Stock/reports/OtherStockSummary';
import StockReorderReport from '../scenes/Stock/reports/StockReorderReport';
import RemainingFeedStockDays from '../scenes/Stock/reports/RemainingFeedStockDays';
import AnimalWiseCost from '../scenes/Stock/reports/AnimalWiseCost';
import StockLedger from '../scenes/Stock/reports/StockLedger';
import StockLedgerAmount from '../scenes/Stock/reports/StockLedgerAmount';
import AddMedicineConsumption from '../scenes/Stock/consumption/MedicineConsumption/AddMedicineConsumption';
import AddSemenConsumption from '../scenes/Stock/consumption/SemenConsumption/AddSemenConsumption';
import AddOtherConsumption from '../scenes/Stock/consumption/OtherConsumption/AddOtherConsumption';
import MedicineConsumptionReport from '../scenes/Stock/consumption/MedicineConsumption/MedicineConsumptionReport';
import SemenConsumptionReport from '../scenes/Stock/consumption/SemenConsumption/SemenConsumptionReport';
import OtherConsumptionReport from '../scenes/Stock/consumption/OtherConsumption/OtherConsumptionReport';
import ConsumptionExpense from '../scenes/Stock/consumption/OtherConsumption/ConsumptionExpense';

const FeedingConsumptionRoutes = () => {
  return (
    <Routes>
      <Route
        path="/feeding-consumption/add"
        element={<AddFeedingConsumption />}
      />
      <Route
        path="/feeding-consumption/view"
        element={<ViewFeedingConsumption />}
      />
      <Route
        path="/feeding-consumption/day-wise-report"
        element={<DayWiseConsumeReport />}
      />
      <Route
        path="/consumption-expense-wise"
        element={<ConsumptionExpense />}
      />

      <Route
        path="/feeding-consumption/cost-analysis"
        element={<FeedCostAnalysis />}
      />
      <Route path="/reports/feeding-summary" element={<FeedingSummary />} />
      <Route path="/reports/medicine-summary" element={<MedicineSummary />} />
      <Route path="/reports/semen-summary" element={<SemenSummary />} />
      <Route
        path="/reports/other-stock-summary"
        element={<OtherStockSummary />}
      />
      <Route path="/reports/stock-reorder" element={<StockReorderReport />} />
      <Route
        path="/reports/remaining-feeding-stock-days"
        element={<RemainingFeedStockDays />}
      />
      <Route path="/reports/animal-wise-cost" element={<AnimalWiseCost />} />
      <Route path="/reports/stock-ledger" element={<StockLedger />} />
      <Route
        path="/reports/stock-ledger-amount"
        element={<StockLedgerAmount />}
      />
      <Route
        path="/medicine-consumption"
        element={<AddMedicineConsumption />}
      />
      <Route path="/add-semen-consumption" element={<AddSemenConsumption />} />
      <Route path="/add-consumption" element={<AddOtherConsumption />} />
      <Route
        path="/medicine-consumption-report"
        element={<MedicineConsumptionReport />}
      />
      <Route
        path="/semen-consumption-report"
        element={<SemenConsumptionReport />}
      />

      <Route
        path="/other-stock-consumption-report"
        element={<OtherConsumptionReport />}
      />
    </Routes>
  );
};

export default FeedingConsumptionRoutes;
