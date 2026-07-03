export const API_CONFIG = {
  auth: {
    login: '/auth/signin',
    signup: '/auth/signup',
    forgetPassword: '/auth/forget-password',
    passwordReset: '/auth/reset-password',
    current: '/auth/current'
  },
  rbac: {
    roles: '/roles',
    permissions: '/permissions',
    adminUsers: '/admin/user'
  },
  softwareAdmin: {
    signin: '/software-admin/auth/signin',
    verifyOtp: '/software-admin/auth/verify-otp',
    current: '/software-admin/auth/current',
    farms: '/software-admin/farms',
    blockUnblockFarm: '/software-admin/farms/block-unblock',
    revokeFarm: '/software-admin/farms/revoke',
    farmDiscount: '/software-admin/farms/discount',
    farmUsage: '/software-admin/farms/usage',
    impersonateFarm: '/software-admin/farms/impersonate',
    billing: {
      overview: '/software-admin/billing/overview',
      revenue: '/software-admin/billing/revenue',
      revenuePayments: '/software-admin/billing/revenue/payments',
      plans: '/software-admin/billing/plans',
      subscriptions: '/software-admin/billing/subscriptions',
      subscriptionByFarm: '/software-admin/billing/subscriptions/by-farm',
      suspendSubscription: '/software-admin/billing/subscriptions/suspend',
      reactivateSubscription: '/software-admin/billing/subscriptions/reactivate',
      cancelSubscription: '/software-admin/billing/subscriptions/cancel',
      extendSubscription: '/software-admin/billing/subscriptions/extend',
      trueUpSubscription: '/software-admin/billing/subscriptions/true-up',
      payments: '/software-admin/billing/payments',
      invoice: '/software-admin/billing/payments/invoice',
      featureFlags: '/software-admin/billing/feature-flags',
      auditLogs: '/software-admin/billing/audit-logs'
    }
  },
  dashboard: {
    herdinfo: '/dashboard',
    milk: '/dashboard/milk',
    lactation: '/dashboard/milk/lactation',
    comparison: '/dashboard/comparison',
    financialsEstimate: '/dashboard/financials-estimate'
  },
  animal: {
    getanimal: '/animal',
    addanimal: '/animal',
    breedTypes: '/breed-types',
    animalTypes: '/animal-types',
    animalSubCategories: '/animal-sub-categories',
    bull: '/bull',
    profile: (id: string) => `/animal/${id}/profile`
  },
  breeding_events: {
    registerProtocol: '/breeding-events/protocol',
    protocol: '/protocol',
    injection: '/protocol/injections',
    aiBreeding: '/breeding-events/ai',
    bullBreeding: '/breeding-events/bull',
    headDetection: '/breeding-events/heat',
    pregnancy: '/breeding-events/pregnancy',
    abortion: '/breeding-events/abortion',
    dryoff: '/breeding-events/dryoff',
    calivng: '/breeding-events/calving',
    alerts: '/breeding-events/alerts',
    reproductionSummary: '/breeding-events/reproduction-summary'
  },
  milk: {
    getMilk: '/milk',
    Averagemilk: '/milk/average-milk-report',
    ApprovedMilk: '/milk/approved',
    PendingApprovalMilkDates: '/milk/pending-milk-approved/dates',
    graph: '/milk/graph',
    milkdifferencereport: '/milk/milk-difference-report',
    out: '/milk/out',
    analytics: '/milk/analytics',
    session: '/milk/session',
    milkbyDate: '/milk/by-date'
  },
  treatments: {
    list: '/treatments',
    withdrawals: '/treatments/withdrawals',
    summary: '/treatments/summary'
  },
  pen: '/pen',
  tag: '/tag',
  events: {
    removeAnimal: '/events/remove-animal',
    moveToPen: '/events/move-to-pen',
    healthStatusHistory: '/events/health-status-history',
    weightHistory: '/events/weight-history',
    tagHistory: '/events/tag-history',
    penHistory: '/events/pen-history'
  },
  users: {
    getUser: 'admin/user'
  },
  stock: {
    categories: '/stock-categories',
    units: '/units',
    items: '/stock-items',
    feedCost: '/stock-items/cost',
    updateItem: '/stock-items'
  },
  feeding: {
    addFeedingConsumption: '/feed-formulation',
    addMultipleConsumption: '/stock-transactions/multiple',
    getFeedingConsumptions: '/feed-formulation',
    getConsumptionReport: '/feed-formulation/report',
    getFeedCostAnalysis: '/feed-formulation/analysis',
    getDayWiseConsumption: '/stock-items/day-wise-consumption-report'
  },
  employee: {
    add: '/employees',
    get: '/employees',
    delete: '/employees',
    update: '/employees'
  },
  department: {
    get: '/departments',
    add: '/departments',
    update: '/departments',
    delete: '/departments'
  },
  designation: {
    get: '/designations',
    add: '/designations',
    update: '/designations',
    delete: '/designations'
  },
  salary: {
    generate: '/salary',
    update: '/salary',
    get: '/salary',
    markPaid: '/salary/paid',
    delete: '/salary',
    addAdvance: '/salary/advance',
    getAdvance: '/salary/advance',
    updateAdvance: '/salary/advance',
    // New endpoints
    employees: '/salary/employees',
    batchEdit: '/salary/employees',
    batchGenerate: '/salary/employees/generate',
    giveAdvance: '/salary/advance/give',
    receiveAdvance: '/salary/advance/receive',
    advanceHistory: '/salary/advance/history'
  },
  attendance: {
    add: '/attendance',
    get: '/attendance',
    update: '/attendance',
    delete: '/attendance'
  },

  company: '/companies',
  InternalConsumptions: '/milk-categories',
  finance: {
    dashboard: '/finance/dashboard',
    accounts: '/finance/accounts',
    categories: '/finance/categories',
    transactions: '/finance/transactions',
    journalEntries: '/finance/journal-entries',
    periods: '/finance/periods',
    currentPeriod: '/finance/periods/current',
    budgets: '/finance/budgets',
    budgetAlerts: '/finance/budgets/alerts',
    settings: '/finance/settings',
    reports: {
      trialBalance: '/finance/reports/trial-balance',
      profitLoss: '/finance/reports/profit-loss',
      balanceSheet: '/finance/reports/balance-sheet',
      generalLedger: '/finance/reports/general-ledger'
    }
  }
};
