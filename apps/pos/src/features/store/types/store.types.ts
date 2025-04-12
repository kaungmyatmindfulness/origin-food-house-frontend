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

export interface Information {
  id: string;
  storeId: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}
export interface Store {
  id: string;
  slug: string;
  information: Information;
}
