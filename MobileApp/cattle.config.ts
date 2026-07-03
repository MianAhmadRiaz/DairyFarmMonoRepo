// For local dev: Android emulator reaches the host via 10.0.2.2; an iOS
// simulator can use localhost; a physical device needs the machine LAN IP.
const URL = 'http://localhost:2500/api/v1'

const API_CONFIG = {
  BASE_URL: URL,
  AUTH: {
    login: '/auth/signin',
    current: '/auth/current',
    setPassword: '/auth/set-password',
    logout: '/auth/logout',
    forgetPassword: '/auth/forget-password',
    resetPassword: '/auth/reset-password',
    verifyOtp: '/auth/reset-password',
    resendOTP: '/auth/forget-password'
  },
  // Herd / animals
  ANIMAL: '/animal',
  ANIMAL_PREGNANCY: '/animal/pregnency-details',
  TAG: '/tag',
  PEN: '/pen',
  BREED_TYPES: '/breed-types',
  ANIMAL_TYPES: '/animal-types',
  ANIMAL_SUB_CATEGORIES: '/animal-sub-categories',
  BULL: '/bull',
  EVENTS: {
    REMOVE_ANIMAL: '/events/remove-animal',
    MOVE_TO_PEN: '/events/move-to-pen',
    UPDATE_TAG: '/events/update-tag',
    UPDATE_WEIGHT: '/events/update-weight',
    UPDATE_HEALTH: '/events/update-health-status'
  },
  // Breeding — legacy keys (HEAT_DETECTION/TAGS/AIBreeding) kept for existing screens.
  BREEDING_EVENTS: {
    HEAT_DETECTION: '/breeding-events/heat',
    TAGS: '/tag',
    AIBreeding: '/breeding-events/ai',
    HEAT: '/breeding-events/heat',
    AI: '/breeding-events/ai',
    BULL: '/breeding-events/bull',
    PREGNANCY: '/breeding-events/pregnancy',
    ABORTION: '/breeding-events/abortion',
    CALVING: '/breeding-events/calving',
    DRYOFF: '/breeding-events/dryoff',
    PROTOCOL: '/breeding-events/protocol',
    ALERTS: '/breeding-events/alerts',
    REPRODUCTION_SUMMARY: '/breeding-events/reproduction-summary'
  },
  // Health / treatments
  TREATMENTS: '/treatments',
  TREATMENT_WITHDRAWALS: '/treatments/withdrawals',
  TREATMENT_SUMMARY: '/treatments/summary',
  // Milk
  MILK: {
    BASE: '/milk',
    SESSION: '/milk/session',
    APPROVED: '/milk/approved',
    PENDING_DATES: '/milk/pending-milk-approved/dates',
    OUT: '/milk/out',
    BY_DATE: '/milk/by-date',
    ANALYTICS: '/milk/analytics',
    GRAPH: '/milk/graph'
  },
  MILK_CATEGORIES: '/milk-categories',
  COMPANIES: '/companies',
  // Feeding
  FEEDING: {
    RECIPES: '/feeding/recipes',
    RECIPE_GROUPS: '/feeding/recipe-groups',
    INGREDIENTS: '/feeding/ingredients',
    SHEDS: '/feeding/sheds',
    PENS_WITH_ANIMALS: '/feeding/pens-with-animals',
    APPLY_SHED: '/feeding/apply-recipe-shed',
    RECORD_ACTUAL: '/feeding/record-actual',
    SHED_REPORT: '/feeding/shed-feed-report'
  },
  FEED_FORMULATION: '/feed-formulation',
  FEED_USAGE: '/feed-formulation/usage',
  // Stock / inventory
  STOCK: {
    ITEMS: '/stock-items',
    LEVEL: '/stock-items/level',
    ALERT: '/stock-items/alert',
    CATEGORIES: '/stock-categories',
    MEDICINE_CATEGORIES: '/medicine-categories',
    TRANSACTIONS: '/stock-transactions',
    TRANSACTIONS_MULTIPLE: '/stock-transactions/multiple',
    PURCHASES: '/purchase-items',
    SUPPLIERS: '/suppliers',
    UNITS: '/units',
    REPORTS: '/stock-reports',
    REORDER: '/stock-reports/re-order',
    EXPIRY: '/stock-reports/expiry'
  },
  // Employees / HR
  EMPLOYEE: {
    BASE: '/employees',
    ATTENDANCE: '/attendance',
    DEPARTMENTS: '/departments',
    DESIGNATIONS: '/designations',
    TASKS: '/tasks',
    REQUESTS: '/requests',
    SALARY: '/salary',
    SALARY_EMPLOYEES: '/salary/employees',
    SALARY_PAID: '/salary/paid'
  },
  // Finance
  FINANCE: {
    DASHBOARD: '/finance/dashboard',
    TRANSACTIONS: '/finance/transactions',
    ACCOUNTS: '/finance/accounts',
    LEDGER: '/finance/general-ledger',
    PROFIT_LOSS: '/finance/profit-loss'
  },
  // Admin (farm): users, roles, permissions
  ADMIN: {
    USERS: '/admin/user',
    FARM: '/admin/farm',
    ROLES: '/roles',
    PERMISSIONS: '/permissions'
  },
  // Dashboard
  DASHBOARD: {
    HERD: '/dashboard',
    MILK: '/dashboard/milk',
    LACTATION: '/dashboard/milk/lactation',
    COMPARISON: '/dashboard/comparison',
    FINANCIALS_ESTIMATE: '/dashboard/financials-estimate'
  }
}

export default API_CONFIG
