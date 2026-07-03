// ============================================================
// RBAC API service — roles, permission catalog, farm users.
// ============================================================
import api from '../api/AxiosClient';
import { API_CONFIG } from './apiConfigs';

export interface Role {
  uuid: string;
  name: string;
  description?: string;
  isOwner: boolean;
  isSystem: boolean;
  createdAt?: string;
  permissions: string[];
}

export interface CatalogPermission {
  uuid: string;
  name: string;
  description?: string;
}

export interface PermissionModule {
  module: string;
  permissions: CatalogPermission[];
}

export interface FarmUser {
  uuid: string;
  email: string;
  firstname?: string;
  lastname?: string;
  phoneNumber?: string;
  roleId?: string;
  role?: { uuid: string; name: string } | null;
  createdAt?: string;
}

export interface CreateRolePayload {
  name: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRolePayload {
  roleId: string;
  name?: string;
  description?: string;
  permissions?: string[];
}

export interface CreateFarmUserPayload {
  email: string;
  password: string;
  confirmpassword: string;
  firstname: string;
  lastname: string;
  phoneNumber: string;
  roleId: string;
}

// --- Roles ---------------------------------------------------
export async function getRoles(): Promise<Role[]> {
  const res = await api.get(API_CONFIG.rbac.roles);
  return res.data?.data?.roles ?? [];
}

export async function createRole(payload: CreateRolePayload) {
  const res = await api.post(API_CONFIG.rbac.roles, payload);
  return res.data;
}

export async function updateRole(payload: UpdateRolePayload) {
  const res = await api.put(API_CONFIG.rbac.roles, payload);
  return res.data;
}

export async function deleteRole(roleId: string) {
  const res = await api.delete(`${API_CONFIG.rbac.roles}?roleId=${roleId}`);
  return res.data;
}

// --- Permission catalog --------------------------------------
export async function getPermissionCatalog(): Promise<PermissionModule[]> {
  const res = await api.get(API_CONFIG.rbac.permissions);
  return res.data?.data?.modules ?? [];
}

// --- Farm users ----------------------------------------------
export async function getFarmUsers(): Promise<FarmUser[]> {
  const res = await api.get(API_CONFIG.rbac.adminUsers);
  const data = res.data?.data;
  // getUserList returns { Users: [...] } (capital U) or a bare list.
  return data?.Users ?? data?.users ?? [];
}

export async function createFarmUser(payload: CreateFarmUserPayload) {
  const res = await api.post(API_CONFIG.rbac.adminUsers, payload);
  return res.data;
}

export async function updateUserRole(userId: string, roleId: string) {
  const res = await api.put(API_CONFIG.rbac.adminUsers, { userId, roleId });
  return res.data;
}

export async function deleteFarmUser(userId: string) {
  const res = await api.delete(`${API_CONFIG.rbac.adminUsers}?userId=${userId}`);
  return res.data;
}
