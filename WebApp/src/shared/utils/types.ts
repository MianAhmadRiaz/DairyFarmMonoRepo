export interface UserState {
  user: User | null;
  authToken: string;
  rememberMe: boolean;
  isSoftwareAdmin?: boolean;
  selectedModule:
    | 'herd'
    | 'stock'
    | 'milking'
    | 'employee'
    | 'feeding'
    | 'accounts'
    | 'admin';
}

export interface User {
  uuid: string;
  isDeleted: boolean;
  isBlocked: boolean;
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  farmId: string;
  updatedAt: string;
  createdAt: string;
  token: string;
}
