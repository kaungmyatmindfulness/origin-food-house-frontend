export interface CreateStoreDto {
  name: string;
  address?: string;
  phone?: string;
}

export interface UpdateStoreDto {
  name?: string;
  address?: string;
  phone?: string;
}

export interface InviteOrAssignRoleDto {
  email: string;
  role: 'OWNER' | 'ADMIN' | 'CASHIER' | 'CHEF';
}

/** Represents a store returned by the backend */
export interface Store {
  id: number;
  name: string;
  address?: string;
  phone?: string;
}
