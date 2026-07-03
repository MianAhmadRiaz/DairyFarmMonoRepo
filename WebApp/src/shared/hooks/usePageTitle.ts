import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Map routes to page titles - Complete list for entire app
const routeTitles: Record<string, string> = {
  // ==================== AUTH ====================
  '/login': 'Login',
  '/sign-up': 'Sign Up',
  '/forgot-password': 'Forgot Password',
  '/verify-code': 'Verify Code',
  '/set-new-password': 'Set New Password',
  '/after-login': 'Select Module',

  // ==================== HERD MANAGEMENT / MAIN ====================
  '/dashboard': 'Dashboard',
  '/herd-dashboard': 'Herd Dashboard',
  '/add-animal': 'Add Animal',
  '/animal-info': 'Animal Info',
  '/move-to-pen': 'Move to Pen',
  '/remove-animal': 'Remove Animal',
  '/view-calves': 'View Calves',
  '/cmt-test': 'CMT Test',
  '/faq': 'FAQ',

  // ==================== BREEDING EVENTS ====================
  '/breeding-events': 'Breeding Events',
  '/protocol': 'Protocol',
  '/bull-breeding': 'Bull Breeding',
  '/bull-breeding/new': 'Add Bull Breeding Event',
  '/ai-breeding': 'AI Breeding',
  '/aibreeding/new': 'Add AI Breeding Event',
  '/heat-detection': 'Heat Detection',
  '/pregnancy-check': 'Pregnancy Check',
  '/pregnancy-test/new': 'Add Pregnancy Test',
  '/abortion': 'Abortion',
  '/abortion/new': 'Add Abortion Event',
  '/calving': 'Calving',
  '/dry-off': 'Dry Off',

  // ==================== MILK MANAGEMENT ====================
  '/milk-dashboard': 'Milk Dashboard',
  '/add-milking-session': 'Add Milking Session',
  '/list-of-milking': 'Approved Milk List',
  '/milk-in-out': 'Milk In/Out',
  '/daily-milk-report': 'Daily Milk Report',
  '/average-milk-report': 'Average Milk Report',
  '/milk-out': 'Milk Out',
  '/milk-difference-report': 'Milk Difference Report',
  '/cow-milking-report': 'Cow Milking Report',

  // ==================== STOCK MANAGEMENT ====================
  '/stock/dashboard': 'Stock Dashboard',
  '/stock-registration': 'Stock Registration',
  '/view-registration': 'View Registration',
  '/open-voucher': 'Open Voucher',
  '/feeding-stock': 'Feeding Stock',
  '/medication-stock': 'Medication Stock',
  '/semen-stock': 'Semen Stock',
  '/other-stock': 'Other Stock',
  '/issuance/add-stock-issuance': 'Add Stock Issuance',
  '/issuance/view-stock-issuance': 'View Stock Issuance',

  // ==================== EMPLOYEE MANAGEMENT ====================
  '/employee/dashboard': 'Employee Dashboard',
  '/employee/new': 'Add New Employee',
  '/employee/view/employee': 'View Employees',
  '/employee/generate-salary': 'Generate Salary',
  '/employee/view/generate-salary': 'View Generated Salary',
  '/employee/unpaid-salary': 'Unpaid Salary',
  '/employee/view/paid-income': 'View Paid Income',
  '/employee/add-advance': 'Add Advance',
  '/employee/edit-advance': 'Edit Advance',
  '/employee/view-advance': 'View Advance',
  '/employee/receive-advance': 'Receive Advance',
  '/employee/attendance': 'Attendance',
  '/employee/view-attendance-report': 'View Attendance Report',

  // ==================== FEEDING MANAGEMENT ====================
  '/create-recipe': 'Create Recipe',
  '/view-recipe': 'View Recipe',
  '/shed-feed-report': 'Shed Feed Report',
  '/date-wise-shed-feed-report': 'Date Wise Shed Feed Report',
  '/shed-feed-stock-print': 'Shed Feed Stock Print',
  '/conducted-vanda-feed-formulation': 'Conducted Vanda Feed Formulation',
  '/create-feed-formulation': 'Create Feed Formulation',
  '/view-feed-formulation': 'View Feed Formulation',
  '/view-conducted-vanda-formulation': 'View Conducted Vanda Formulation',
  '/apply-feed-recipe-shed': 'Apply Feed Recipe to Shed',
  '/apply-feed-recipeA-adjustable-shed': 'Apply Feed Recipe Adjustable Shed',

  // ==================== FEEDING CONSUMPTION ====================
  '/feeding-consumption/add': 'Add Feeding Consumption',
  '/feeding-consumption/view': 'View Feeding Consumption',
  '/feeding-consumption/day-wise-report': 'Day Wise Consumption Report',
  '/consumption-expense-wise': 'Consumption Expense',
  '/feeding-consumption/cost-analysis': 'Feed Cost Analysis',
  '/medicine-consumption': 'Medicine Consumption',
  '/add-semen-consumption': 'Add Semen Consumption',
  '/add-consumption': 'Add Other Consumption',
  '/medicine-consumption-report': 'Medicine Consumption Report',
  '/semen-consumption-report': 'Semen Consumption Report',
  '/other-stock-consumption-report': 'Other Stock Consumption Report',

  // ==================== STOCK REPORTS ====================
  '/reports/feeding-summary': 'Feeding Summary',
  '/reports/medicine-summary': 'Medicine Summary',
  '/reports/semen-summary': 'Semen Summary',
  '/reports/other-stock-summary': 'Other Stock Summary',
  '/reports/stock-reorder': 'Stock Reorder Report',
  '/reports/remaining-feeding-stock-days': 'Remaining Feed Stock Days',
  '/reports/animal-wise-cost': 'Animal Wise Cost',
  '/reports/stock-ledger': 'Stock Ledger',
  '/reports/stock-ledger-amount': 'Stock Ledger Amount',

  // ==================== ACCOUNTS / FINANCE ====================
  '/accounts/dashboard': 'Finance Dashboard',
  '/accounts/milk-dispatch': 'Milk Dispatch',
  '/accounts/milk-dispatch-via-excel': 'Milk Dispatch via Excel',
  '/accounts/milking-payments': 'Milking Payments',
  '/accounts/view-milk-dispatch': 'View Milk Dispatch',
  '/accounts/view-milk-payments': 'View Milk Payments',
  '/accounts/add-account-head': 'Add Account Head',
  '/accounts/chart-of-accounts': 'Chart of Accounts',
  '/accounts/opening-voucher-accounts': 'Opening Voucher Accounts',
  '/accounts/charts-of-accounts-levels': 'Chart of Accounts Levels',
  '/accounts/cash-customers': 'Cash Customers',
  '/accounts/view-transactions': 'View Transactions',
  '/accounts/cpv-transaction': 'Cash Payment Voucher',
  '/accounts/bpv-transaction': 'Bank Payment Voucher',
  '/accounts/crv-transaction': 'Cash Receipt Voucher',
  '/accounts/brv-transaction': 'Bank Receipt Voucher',
  '/accounts/make-journal-transaction': 'Journal Transaction',
  '/accounts/make-purchase-transaction': 'Purchase Transaction',
  '/accounts/make-sales-transaction': 'Sales Transaction',
  '/accounts/make-purchase-return': 'Purchase Return',
  '/accounts/make-sales-return': 'Sales Return',
  '/accounts/account-statements': 'Account Statements',
  '/accounts/customer-milk-sale': 'Customer Milk Sale',
  '/accounts/reports/general-ledger': 'General Ledger',
  '/accounts/reports/ledger-report': 'Ledger Report',
  '/accounts/reports/total-milk-consumption-report':
    'Total Milk Consumption Report',
  '/accounts/reports/profit-loss-report': 'Profit & Loss Report'
};

const getPageTitle = (pathname: string): string => {
  // Direct match
  if (routeTitles[pathname]) {
    return routeTitles[pathname];
  }

  // Check for dynamic routes (e.g., /employee/profile/123)
  for (const [route, title] of Object.entries(routeTitles)) {
    const routeParts = route.split('/');
    const pathParts = pathname.split('/');

    if (routeParts.length === pathParts.length) {
      const isMatch = routeParts.every((part, index) => {
        return part === pathParts[index] || part.startsWith(':');
      });
      if (isMatch) return title;
    }
  }

  // Fallback: Generate title from pathname
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

  useEffect(() => {
    const title = customTitle || getPageTitle(location.pathname);
    document.title = `${title} | Cattle Care`;
  }, [location.pathname, customTitle]);
};

export default usePageTitle;
