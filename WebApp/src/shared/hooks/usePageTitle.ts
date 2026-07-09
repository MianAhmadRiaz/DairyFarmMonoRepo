import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Map routes to page title translation keys - Complete list for entire app
const routeTitleKeys: Record<string, string> = {
  // ==================== AUTH ====================
  '/login': 'login',
  '/sign-up': 'signUp',
  '/forgot-password': 'forgotPassword',
  '/verify-code': 'verifyCode',
  '/set-new-password': 'setNewPassword',
  '/after-login': 'selectModule',

  // ==================== HERD MANAGEMENT / MAIN ====================
  '/dashboard': 'dashboard',
  '/herd-dashboard': 'herdDashboard',
  '/add-animal': 'addAnimal',
  '/animal-info': 'animalInfo',
  '/move-to-pen': 'moveToPen',
  '/remove-animal': 'removeAnimal',
  '/view-calves': 'viewCalves',
  '/cmt-test': 'cmtTest',
  '/faq': 'faq',

  // ==================== BREEDING EVENTS ====================
  '/breeding-events': 'breedingEvents',
  '/protocol': 'protocol',
  '/bull-breeding': 'bullBreeding',
  '/bull-breeding/new': 'addBullBreedingEvent',
  '/ai-breeding': 'aiBreeding',
  '/aibreeding/new': 'addAiBreedingEvent',
  '/heat-detection': 'heatDetection',
  '/pregnancy-check': 'pregnancyCheck',
  '/pregnancy-test/new': 'addPregnancyTest',
  '/abortion': 'abortion',
  '/abortion/new': 'addAbortionEvent',
  '/calving': 'calving',
  '/dry-off': 'dryOff',

  // ==================== MILK MANAGEMENT ====================
  '/milk-dashboard': 'milkDashboard',
  '/add-milking-session': 'addMilkingSession',
  '/list-of-milking': 'approvedMilkList',
  '/milk-in-out': 'milkInOut',
  '/daily-milk-report': 'dailyMilkReport',
  '/average-milk-report': 'averageMilkReport',
  '/milk-out': 'milkOut',
  '/milk-difference-report': 'milkDifferenceReport',
  '/cow-milking-report': 'cowMilkingReport',

  // ==================== STOCK MANAGEMENT ====================
  '/stock/dashboard': 'stockDashboard',
  '/stock-registration': 'stockRegistration',
  '/view-registration': 'viewRegistration',
  '/open-voucher': 'openVoucher',
  '/feeding-stock': 'feedingStock',
  '/medication-stock': 'medicationStock',
  '/semen-stock': 'semenStock',
  '/other-stock': 'otherStock',
  '/issuance/add-stock-issuance': 'addStockIssuance',
  '/issuance/view-stock-issuance': 'viewStockIssuance',

  // ==================== EMPLOYEE MANAGEMENT ====================
  '/employee/dashboard': 'employeeDashboard',
  '/employee/new': 'addNewEmployee',
  '/employee/view/employee': 'viewEmployees',
  '/employee/generate-salary': 'generateSalary',
  '/employee/view/generate-salary': 'viewGeneratedSalary',
  '/employee/unpaid-salary': 'unpaidSalary',
  '/employee/view/paid-income': 'viewPaidIncome',
  '/employee/add-advance': 'addAdvance',
  '/employee/edit-advance': 'editAdvance',
  '/employee/view-advance': 'viewAdvance',
  '/employee/receive-advance': 'receiveAdvance',
  '/employee/attendance': 'attendance',
  '/employee/view-attendance-report': 'viewAttendanceReport',

  // ==================== FEEDING MANAGEMENT ====================
  '/create-recipe': 'createRecipe',
  '/view-recipe': 'viewRecipe',
  '/shed-feed-report': 'shedFeedReport',
  '/date-wise-shed-feed-report': 'dateWiseShedFeedReport',
  '/shed-feed-stock-print': 'shedFeedStockPrint',
  '/conducted-vanda-feed-formulation': 'conductedVandaFeedFormulation',
  '/create-feed-formulation': 'createFeedFormulation',
  '/view-feed-formulation': 'viewFeedFormulation',
  '/view-conducted-vanda-formulation': 'viewConductedVandaFormulation',
  '/apply-feed-recipe-shed': 'applyFeedRecipeToShed',
  '/apply-feed-recipeA-adjustable-shed': 'applyFeedRecipeAdjustableShed',

  // ==================== FEEDING CONSUMPTION ====================
  '/feeding-consumption/add': 'addFeedingConsumption',
  '/feeding-consumption/view': 'viewFeedingConsumption',
  '/feeding-consumption/day-wise-report': 'dayWiseConsumptionReport',
  '/consumption-expense-wise': 'consumptionExpense',
  '/feeding-consumption/cost-analysis': 'feedCostAnalysis',
  '/medicine-consumption': 'medicineConsumption',
  '/add-semen-consumption': 'addSemenConsumption',
  '/add-consumption': 'addOtherConsumption',
  '/medicine-consumption-report': 'medicineConsumptionReport',
  '/semen-consumption-report': 'semenConsumptionReport',
  '/other-stock-consumption-report': 'otherStockConsumptionReport',

  // ==================== STOCK REPORTS ====================
  '/reports/feeding-summary': 'feedingSummary',
  '/reports/medicine-summary': 'medicineSummary',
  '/reports/semen-summary': 'semenSummary',
  '/reports/other-stock-summary': 'otherStockSummary',
  '/reports/stock-reorder': 'stockReorderReport',
  '/reports/remaining-feeding-stock-days': 'remainingFeedStockDays',
  '/reports/animal-wise-cost': 'animalWiseCost',
  '/reports/stock-ledger': 'stockLedger',
  '/reports/stock-ledger-amount': 'stockLedgerAmount',

  // ==================== ACCOUNTS / FINANCE ====================
  '/accounts/dashboard': 'financeDashboard',
  '/accounts/milk-dispatch': 'milkDispatch',
  '/accounts/milk-dispatch-via-excel': 'milkDispatchViaExcel',
  '/accounts/milking-payments': 'milkingPayments',
  '/accounts/view-milk-dispatch': 'viewMilkDispatch',
  '/accounts/view-milk-payments': 'viewMilkPayments',
  '/accounts/add-account-head': 'addAccountHead',
  '/accounts/chart-of-accounts': 'chartOfAccounts',
  '/accounts/opening-voucher-accounts': 'openingVoucherAccounts',
  '/accounts/charts-of-accounts-levels': 'chartOfAccountsLevels',
  '/accounts/cash-customers': 'cashCustomers',
  '/accounts/view-transactions': 'viewTransactions',
  '/accounts/cpv-transaction': 'cashPaymentVoucher',
  '/accounts/bpv-transaction': 'bankPaymentVoucher',
  '/accounts/crv-transaction': 'cashReceiptVoucher',
  '/accounts/brv-transaction': 'bankReceiptVoucher',
  '/accounts/make-journal-transaction': 'journalTransaction',
  '/accounts/make-purchase-transaction': 'purchaseTransaction',
  '/accounts/make-sales-transaction': 'salesTransaction',
  '/accounts/make-purchase-return': 'purchaseReturn',
  '/accounts/make-sales-return': 'salesReturn',
  '/accounts/account-statements': 'accountStatements',
  '/accounts/customer-milk-sale': 'customerMilkSale',
  '/accounts/reports/general-ledger': 'generalLedger',
  '/accounts/reports/ledger-report': 'ledgerReport',
  '/accounts/reports/total-milk-consumption-report': 'totalMilkConsumptionReport',
  '/accounts/reports/profit-loss-report': 'profitLossReport'
};

const getPageTitleKey = (pathname: string): string | null => {
  // Direct match
  if (routeTitleKeys[pathname]) {
    return routeTitleKeys[pathname];
  }

  // Check for dynamic routes (e.g., /employee/profile/123)
  for (const [route, key] of Object.entries(routeTitleKeys)) {
    const routeParts = route.split('/');
    const pathParts = pathname.split('/');

    if (routeParts.length === pathParts.length) {
      const isMatch = routeParts.every((part, index) => {
        return part === pathParts[index] || part.startsWith(':');
      });
      if (isMatch) return key;
    }
  }

  return null;
};

// Fallback: Generate a title from the pathname when no key matches.
const fallbackTitle = (pathname: string): string => {
  const lastSegment = pathname.split('/').filter(Boolean).pop();
  if (lastSegment) {
    return lastSegment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  return 'DairyCare';
};

export const usePageTitle = (customTitle?: string) => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    let title: string;
    if (customTitle) {
      title = customTitle;
    } else {
      const key = getPageTitleKey(location.pathname);
      title = key ? t('services.pageTitles.' + key) : fallbackTitle(location.pathname);
    }
    document.title = t('services.pageTitleFormat', { title });
  }, [location.pathname, customTitle, t]);
};

export default usePageTitle;
