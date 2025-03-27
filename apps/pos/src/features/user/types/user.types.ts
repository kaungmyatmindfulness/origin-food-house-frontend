import { Store } from '@/features/store/types/store.types';

export type UserRole = 'OWNER' | 'ADMIN' | 'CASHIER' | 'CHEF';

export interface UserStore {
  id: number;
  userId: number;
  storeId: number;
  role: UserRole;
  store: Store;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
}

export interface AddUserToStoreDto {
  userId: number;
  storeId: number;
  role: UserRole;
}

/** For POST /user/register */
export interface RegisterUserData {
  id: number;
  email: string;
}

/** For POST /user/add-to-store */
export interface AddUserToStoreData {
  id: number;
  userId: number;
  storeId: number;
  role: string;
}

/** For GET /user/{id}/stores */
export interface UserStoreRole {
  id: number;
  userId: number;
  storeId: number;
  role: string;
}

/** For GET /user/me */
export interface CurrentUserData {
  id: number;
  email: string;
  name: string;
  userStores: UserStore[];
  currentStore: Store;
  currentRole: UserRole;
}
