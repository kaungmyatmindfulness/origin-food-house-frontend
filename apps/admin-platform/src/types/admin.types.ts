export interface AdminProfile {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN';
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminState {
  adminProfile: AdminProfile | null;
  permissions: string[];
}

export interface AdminActions {
  setAdminProfile: (profile: AdminProfile | null) => void;
  setPermissions: (permissions: string[]) => void;
  clearAdmin: () => void;
}
