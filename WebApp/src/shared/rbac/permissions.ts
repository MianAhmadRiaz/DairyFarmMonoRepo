// Frontend mirror of the backend permission catalog (module:action strings).
// Used to gate navigation and action buttons. Keep in sync with the API's
// src/constants/rbac.js.
export const PERMISSIONS = {
  HERD_VIEW: 'herd:view',
  HERD_CREATE: 'herd:create',
  HERD_EDIT: 'herd:edit',
  HERD_DELETE: 'herd:delete',
  ANIMAL_REMOVE: 'herd:remove_animal',
  BREEDING_VIEW: 'breeding:view',
  BREEDING_MANAGE: 'breeding:manage',
  HEALTH_VIEW: 'health:view',
  HEALTH_MANAGE: 'health:manage',
  MILK_VIEW: 'milk:view',
  MILK_RECORD: 'milk:record',
  MILK_APPROVE: 'milk:approve',
  MILK_DISPATCH: 'milk:dispatch',
  FEED_VIEW: 'feeding:view',
  FEED_MANAGE: 'feeding:manage',
  STOCK_VIEW: 'stock:view',
  STOCK_MANAGE: 'stock:manage',
  STOCK_PURCHASE: 'stock:purchase',
  EMPLOYEE_VIEW: 'employee:view',
  EMPLOYEE_MANAGE: 'employee:manage',
  SALARY_MANAGE: 'employee:salary',
  SALARY_PAY: 'employee:salary_pay',
  FINANCE_VIEW: 'finance:view',
  FINANCE_MANAGE: 'finance:manage',
  USER_VIEW: 'admin:user_view',
  USER_MANAGE: 'admin:user_manage',
  ROLE_MANAGE: 'admin:role_manage',
  FARM_SETTINGS: 'admin:farm_settings',
  REPORTS_VIEW: 'reports:view',
  DASHBOARD_VIEW: 'dashboard:view'
} as const;

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Which permission a top-level module (sidebar section) requires to be visible.
export const MODULE_VIEW_PERMISSION: Record<string, PermissionName> = {
  herd: PERMISSIONS.HERD_VIEW,
  milking: PERMISSIONS.MILK_VIEW,
  feeding: PERMISSIONS.FEED_VIEW,
  stock: PERMISSIONS.STOCK_VIEW,
  employee: PERMISSIONS.EMPLOYEE_VIEW,
  accounts: PERMISSIONS.FINANCE_VIEW,
  admin: PERMISSIONS.USER_VIEW
};
