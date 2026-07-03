import React from 'react';
import { Route, Routes } from 'react-router-dom';
import FinanceDashboard from '../scenes/Accounts/FinanceDashboard';
import MilkDispatch from '../scenes/Accounts/MilkDispatch';
import MilkingPayments from '../scenes/Accounts/MilkingPayments';
import ViewMilkDispatch from '../scenes/Accounts/ViewMilkDispatch';
import ViewMilkPayments from '../scenes/Accounts/ViewMilkPayments';
import AddAccountHead from '../scenes/Accounts/AddAccountHead';
import ChartOfAccounts from '../scenes/Accounts/ChartOfAccounts';
import OpeningVoucherAccount from '../scenes/Accounts/OpeningVoucherAccount';
import ChartsOfAccountLevels from '../scenes/Accounts/ChartsOfAccountLevels';
import CashCustomers from '../scenes/Accounts/CashCustomers';
import MilkDispatchViaExcel from '../scenes/Accounts/MilkDispatchViaExcel';
import ViewTransactions from '../scenes/Accounts/ViewTransactions';
import CPVTransaction from '../scenes/Accounts/CPVTransaction';
import BPVTransaction from '../scenes/Accounts/BPVTransaction';
import CRVTransaction from '../scenes/Accounts/CRVTransaction';
import BRVTransaction from '../scenes/Accounts/BRVTransaction';
import MakeJournalTransaction from '../scenes/Accounts/MakeJournalTransaction';
import PurchaseTransaction from '../scenes/Accounts/PurchaseTransaction';
import SalesTransaction from '../scenes/Accounts/SalesTransaction';
import PurchaseReturnTransaction from '../scenes/Accounts/PurchaseReturnTransaction';
import SalesReturnTransaction from '../scenes/Accounts/SalesReturnTransaction';
import AccountStatements from '../scenes/Accounts/AccountStatements';
import CustomerMilkSale from '../scenes/Accounts/CustomerMilkSale';
import GeneralLedger from '../scenes/Accounts/GeneralLedger';
import LedgerReport from '../scenes/Accounts/LedgerReport';
import TotalMilkConsumptionReport from '../scenes/Accounts/TotalMilkConsumptionReport';
import ProfitLossReport from '../scenes/Accounts/ProfitLossReport';
// import MergeAccountHead from '../scenes/Accounts/MergeAccountHead';

const FinanceRoutes = () => {
  return (
    <Routes>
      <Route path="/accounts/dashboard" element={<FinanceDashboard />} />
      //Corporate
      <Route path="/accounts/milk-dispatch" element={<MilkDispatch />} />
      <Route
        path="/accounts/milk-dispatch-via-excel"
        element={<MilkDispatchViaExcel />}
      />
      <Route path="/accounts/milking-payments" element={<MilkingPayments />} />
      <Route
        path="/accounts/view-milk-dispatch"
        element={<ViewMilkDispatch />}
      />
      <Route
        path="/accounts/view-milk-payments"
        element={<ViewMilkPayments />}
      />
      <Route path="/accounts/add-account-head" element={<AddAccountHead />} />
      <Route path="/accounts/chart-of-accounts" element={<ChartOfAccounts />} />
      {/* <Route
        path="/accounts/merge-transfer-accounts"
        element={<MergeAccountHead />}
      /> */}
      <Route
        path="/accounts/opening-voucher-accounts"
        element={<OpeningVoucherAccount />}
      />
      <Route
        path="/accounts/charts-of-accounts-levels"
        element={<ChartsOfAccountLevels />}
      />
      <Route path="/accounts/cash-customers" element={<CashCustomers />} />
      <Route
        path="/accounts/view-transactions"
        element={<ViewTransactions />}
      />
      <Route path="/accounts/cpv-transaction" element={<CPVTransaction />} />
      <Route path="/accounts/bpv-transaction" element={<BPVTransaction />} />
      <Route path="/accounts/crv-transaction" element={<CRVTransaction />} />
      <Route path="/accounts/brv-transaction" element={<BRVTransaction />} />
      <Route
        path="/accounts/make-journal-transaction"
        element={<MakeJournalTransaction />}
      />
      <Route
        path="/accounts/make-purchase-transaction"
        element={<PurchaseTransaction />}
      />
      <Route
        path="/accounts/make-sales-transaction"
        element={<SalesTransaction />}
      />
      <Route
        path="/accounts/make-purchase-return"
        element={<PurchaseReturnTransaction />}
      />
      <Route
        path="/accounts/make-sales-return"
        element={<SalesReturnTransaction />}
      />
      <Route
        path="/accounts/account-statements"
        element={<AccountStatements />}
      />
      <Route
        path="/accounts/customer-milk-sale"
        element={<CustomerMilkSale />}
      />
      <Route
        path="/accounts/reports/general-ledger"
        element={<GeneralLedger />}
      />
      <Route
        path="/accounts/reports/ledger-report"
        element={<LedgerReport />}
      />
      <Route
        path="/accounts/reports/total-milk-consumption-report"
        element={<TotalMilkConsumptionReport />}
      />
      <Route
        path="/accounts/reports/profit-loss-report"
        element={<ProfitLossReport />}
      />
    </Routes>
  );
};
export default FinanceRoutes;
