import api, { axiosClient } from '../../api/AxiosClient';
import { API_CONFIG } from '../apiConfigs';

// ==========================================================================
// Types
// ==========================================================================
export interface AdminSigninResponse {
  uuid: string;
  email: string;
  firstname: string;
  lastname: string;
  token: string;
  url?: string; // present on first login (authenticator QR setup)
  authentication?: boolean;
}

export interface SubscriptionPlan {
  uuid: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  billing_cycle: 'monthly' | 'quarterly' | 'half_yearly' | 'yearly';
  max_animals: number | null;
  max_employees: number | null;
  features: string[];
  trial_days: number;
  is_active: boolean;
  pricing_model: 'flat' | 'per_animal';
  per_animal_rate: number;
  is_trial_plan: boolean;
}

export interface FarmSubscription {
  uuid: string;
  farmId: string;
  planId: string | null;
  plan_name: string;
  amount: number;
  currency: string;
  billing_cycle: string;
  status: 'trialing' | 'active' | 'past_due' | 'suspended' | 'cancelled';
  start_date: string;
  current_period_start: string;
  next_due_date: string;
  grace_days: number;
  auto_suspend: boolean;
  pricing_model?: 'flat' | 'per_animal';
  per_animal_rate?: number;
  billed_animal_count?: number;
  discount_type?: 'none' | 'percentage' | 'flat';
  discount_value?: number;
  gross_amount?: number;
  farm?: { uuid: string; name: string; is_active: boolean; isBlocked: boolean; status: string };
  plan?: Partial<SubscriptionPlan>;
}

export interface FarmPayment {
  uuid: string;
  farmId: string;
  subscriptionId: string | null;
  invoice_number: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  method: string;
  payment_date: string;
  period_start: string | null;
  period_end: string | null;
  reference?: string;
  notes?: string;
  farm?: { uuid: string; name: string };
}

export interface FeatureFlag {
  module_key: string;
  is_enabled: boolean;
}

export interface BillingOverview {
  farms: { total: number; active: number; suspended: number };
  subscriptions: {
    trialing: number;
    active: number;
    past_due: number;
    suspended: number;
    cancelled: number;
  };
  revenue: { thisMonth: number; total: number };
  overdueSubscriptions: FarmSubscription[];
  recentPayments: FarmPayment[];
}

export interface Farm {
  uuid: string;
  name: string;
  status: string;
  is_active: boolean;
  isBlocked: boolean;
  location?: string;
  createdAt?: string;
  is_revoked?: boolean;
  revoke_reason?: string;
  discount_type?: 'none' | 'percentage' | 'flat';
  discount_value?: number;
  discount_note?: string;
}

export interface FarmUsage {
  animals: { used: number; limit: number | null; overLimit: boolean };
  employees: { used: number; limit: number | null; overLimit: boolean };
  subscription: {
    plan_name?: string;
    status?: string;
    pricing_model?: 'flat' | 'per_animal';
    per_animal_rate?: number;
    billed_animal_count?: number;
    [key: string]: any;
  };
}

export interface ImpersonateResult {
  token: string;
  user: any;
  farm: any;
}

export interface RevenueByPlan {
  plan_name: string;
  farmCount: number;
  totalAmount: number;
}

export interface RevenueTrendPoint {
  month: string;
  total: number;
}

export interface RevenueDashboard {
  currency: string;
  mrr: number;
  arr: number;
  collectedThisMonth: number;
  collectedTotal: number;
  pendingPayments: number;
  outstanding: number;
  revenueByPlan: RevenueByPlan[];
  trend: RevenueTrendPoint[];
}

export interface TrueUpResult {
  proratedCharge: number;
  addedAnimals: number;
  currentCount: number;
  billedCount: number;
  remainingDays: number;
  currency: string;
}

export interface AuditLog {
  uuid: string;
  adminId: string;
  admin_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  description: string;
  ip_address?: string;
  createdAt: string;
}

// ==========================================================================
// Auth
// ==========================================================================
export async function adminSignin(email: string, password: string): Promise<AdminSigninResponse> {
  const res = await api.post(API_CONFIG.softwareAdmin.signin, { email, password });
  return res.data.data;
}

export async function adminVerifyOtp(otp: string, tempToken: string): Promise<AdminSigninResponse> {
  // The temporary 2FA token is passed explicitly so it is not stored in redux
  // before the OTP is verified (which would prematurely switch the app shell).
  const res = await axiosClient.post(
    API_CONFIG.softwareAdmin.verifyOtp,
    { otp },
    { headers: { Authorization: `Bearer ${tempToken}` } }
  );
  // verify-otp returns the sanitized user directly under data
  return res.data.data ?? res.data;
}

// ==========================================================================
// Farms
// ==========================================================================
export async function getFarms(
  page = 1,
  limit = 50,
  status?: string
): Promise<{ farms: Farm[]; totalCount: number; totalPages: number }> {
  const res = await api.get(API_CONFIG.softwareAdmin.farms, { page, limit, ...(status && { status }) });
  const data = res.data.data;
  return { farms: data?.farms || [], totalCount: data?.totalCount || 0, totalPages: data?.totalPages || 1 };
}

export async function approveOrRejectFarm(farmId: string, status: 'APPROVED' | 'REJECTED'): Promise<void> {
  await api.put(`${API_CONFIG.softwareAdmin.farms}?farmId=${farmId}&status=${status}`, {});
}

export async function blockUnblockFarm(farmId: string): Promise<void> {
  // Backend toggles the farm's blocked state based on its current value.
  await api.put(`${API_CONFIG.softwareAdmin.blockUnblockFarm}?farmId=${farmId}`, {});
}

export async function revokeFarm(farmId: string, revoke: boolean, reason?: string): Promise<void> {
  await api.put(API_CONFIG.softwareAdmin.revokeFarm, { farmId, revoke, ...(reason && { reason }) });
}

export async function setFarmDiscount(payload: {
  farmId: string;
  discount_type: 'none' | 'percentage' | 'flat';
  discount_value: number;
  discount_note?: string;
}): Promise<void> {
  await api.put(API_CONFIG.softwareAdmin.farmDiscount, payload);
}

export async function getFarmUsage(farmId: string): Promise<FarmUsage | null> {
  const res = await api.get(API_CONFIG.softwareAdmin.farmUsage, { farmId });
  return res.data.data || null;
}

export async function impersonateFarm(farmId: string): Promise<ImpersonateResult> {
  const res = await api.post(`${API_CONFIG.softwareAdmin.impersonateFarm}?farmId=${farmId}`, {});
  return res.data.data;
}

// ==========================================================================
// Billing : overview
// ==========================================================================
export async function getBillingOverview(): Promise<BillingOverview | null> {
  const res = await api.get(API_CONFIG.softwareAdmin.billing.overview);
  return res.data.data?.overview || null;
}

// ==========================================================================
// Billing : revenue
// ==========================================================================
export async function getRevenueDashboard(): Promise<RevenueDashboard | null> {
  const res = await api.get(API_CONFIG.softwareAdmin.billing.revenue);
  return res.data.data?.dashboard || null;
}

export async function getRevenuePayments(
  page = 1,
  limit = 20,
  status?: string,
  farmId?: string
): Promise<{ payments: FarmPayment[]; totalCount: number; totalPages: number }> {
  const res = await api.get(API_CONFIG.softwareAdmin.billing.revenuePayments, {
    page,
    limit,
    ...(status && { status }),
    ...(farmId && { farmId })
  });
  const data = res.data.data;
  return { payments: data?.payments || [], totalCount: data?.totalCount || 0, totalPages: data?.totalPages || 1 };
}

// ==========================================================================
// Billing : plans
// ==========================================================================
export async function getPlans(activeOnly = false): Promise<SubscriptionPlan[]> {
  const res = await api.get(API_CONFIG.softwareAdmin.billing.plans, {
    ...(activeOnly && { is_active: true })
  });
  return res.data.data?.plans || [];
}

export async function createPlan(payload: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
  const res = await api.post(API_CONFIG.softwareAdmin.billing.plans, payload);
  return res.data.data?.plan;
}

export async function updatePlan(planId: string, payload: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
  const res = await api.put(`${API_CONFIG.softwareAdmin.billing.plans}?planId=${planId}`, payload);
  return res.data.data?.plan;
}

export async function deletePlan(planId: string): Promise<void> {
  await api.delete(`${API_CONFIG.softwareAdmin.billing.plans}?planId=${planId}`);
}

// ==========================================================================
// Billing : subscriptions
// ==========================================================================
export async function getSubscriptions(
  page = 1,
  limit = 20,
  status?: string
): Promise<{ subscriptions: FarmSubscription[]; totalCount: number; totalPages: number }> {
  const res = await api.get(API_CONFIG.softwareAdmin.billing.subscriptions, {
    page,
    limit,
    ...(status && { status })
  });
  const data = res.data.data;
  return {
    subscriptions: data?.subscriptions || [],
    totalCount: data?.totalCount || 0,
    totalPages: data?.totalPages || 1
  };
}

export async function getSubscriptionByFarm(farmId: string): Promise<FarmSubscription | null> {
  const res = await api.get(`${API_CONFIG.softwareAdmin.billing.subscriptionByFarm}?farmId=${farmId}`);
  return res.data.data?.subscription || null;
}

export async function assignSubscription(payload: {
  farmId: string;
  planId: string;
  start_date?: string;
  grace_days?: number;
  auto_suspend?: boolean;
}): Promise<FarmSubscription> {
  const res = await api.post(API_CONFIG.softwareAdmin.billing.subscriptions, payload);
  return res.data.data?.subscription;
}

export async function suspendSubscription(subscriptionId: string): Promise<void> {
  await api.put(`${API_CONFIG.softwareAdmin.billing.suspendSubscription}?subscriptionId=${subscriptionId}`, {});
}

export async function reactivateSubscription(subscriptionId: string): Promise<void> {
  await api.put(`${API_CONFIG.softwareAdmin.billing.reactivateSubscription}?subscriptionId=${subscriptionId}`, {});
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  await api.put(`${API_CONFIG.softwareAdmin.billing.cancelSubscription}?subscriptionId=${subscriptionId}`, {});
}

export async function extendSubscription(
  subscriptionId: string,
  payload: { days?: number; new_due_date?: string }
): Promise<void> {
  await api.put(`${API_CONFIG.softwareAdmin.billing.extendSubscription}?subscriptionId=${subscriptionId}`, payload);
}

export async function trueUpSubscription(subscriptionId: string): Promise<TrueUpResult> {
  const res = await api.put(
    `${API_CONFIG.softwareAdmin.billing.trueUpSubscription}?subscriptionId=${subscriptionId}`,
    {}
  );
  return res.data.data;
}

// ==========================================================================
// Billing : payments
// ==========================================================================
export async function getPayments(
  page = 1,
  limit = 20,
  farmId?: string
): Promise<{ payments: FarmPayment[]; totalCount: number; totalPages: number }> {
  const res = await api.get(API_CONFIG.softwareAdmin.billing.payments, {
    page,
    limit,
    ...(farmId && { farmId })
  });
  const data = res.data.data;
  return { payments: data?.payments || [], totalCount: data?.totalCount || 0, totalPages: data?.totalPages || 1 };
}

export async function recordPayment(payload: {
  farmId: string;
  subscriptionId?: string;
  amount: number;
  currency?: string;
  method?: string;
  payment_date?: string;
  reference?: string;
  notes?: string;
}): Promise<FarmPayment> {
  const res = await api.post(API_CONFIG.softwareAdmin.billing.payments, payload);
  return res.data.data?.payment;
}

export async function getInvoice(paymentId: string): Promise<FarmPayment | null> {
  const res = await api.get(`${API_CONFIG.softwareAdmin.billing.invoice}?paymentId=${paymentId}`);
  return res.data.data?.invoice || null;
}

// ==========================================================================
// Billing : feature flags
// ==========================================================================
export async function getFeatureFlags(farmId: string): Promise<FeatureFlag[]> {
  const res = await api.get(`${API_CONFIG.softwareAdmin.billing.featureFlags}?farmId=${farmId}`);
  return res.data.data?.flags || [];
}

export async function setFeatureFlag(
  farmId: string,
  module_key: string,
  is_enabled: boolean
): Promise<void> {
  await api.put(API_CONFIG.softwareAdmin.billing.featureFlags, { farmId, module_key, is_enabled });
}

// ==========================================================================
// Billing : audit logs
// ==========================================================================
export async function getAuditLogs(
  page = 1,
  limit = 25
): Promise<{ logs: AuditLog[]; totalCount: number; totalPages: number }> {
  const res = await api.get(API_CONFIG.softwareAdmin.billing.auditLogs, { page, limit });
  const data = res.data.data;
  return { logs: data?.logs || [], totalCount: data?.totalCount || 0, totalPages: data?.totalPages || 1 };
}
