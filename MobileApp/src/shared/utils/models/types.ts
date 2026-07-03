import { NavigationProp, RouteProp } from '@react-navigation/core'

export interface GenericNavigation {
  navigation?: NavigationProp<any>
  route?: RouteProp<any, any>
}

export interface ImageEntity {
  _id: string
  createdAt: Date
  key: string
  updatedAt: Date
  url: string
}

export interface UserState {
  user: User | undefined
  authToken: string
  rememberMe: boolean
}

export interface User {
  uuid: string
  firstname: string
  lastname: string
  email: string
  phoneNumber: string
  farmId: string
  farm?: {
    uuid: string
    name: string
  }
  roleId: string
  role?: {
    uuid: string
    name: RoleName
  }
  // RBAC fields returned by the API on login / current.
  permissions?: string[]
  isOwner?: boolean
  roleName?: string
  must_reset_password?: boolean
  isBlocked: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  token: string
}

export enum RoleName {
  superadmin = 'Super Admin',
  admin = 'Admin',
  user = 'User',
  milker = 'Milker'
}
export const RoleNames = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  user: 'User',
  milker: 'Milker'
}
