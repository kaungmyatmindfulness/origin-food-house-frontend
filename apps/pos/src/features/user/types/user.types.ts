import { Store } from '@/features/store/types/store.types';

export type UserRole = 'OWNER' | 'ADMIN' | 'CASHIER' | 'CHEF';

export interface UserStore {
  id: string;
  userId: string;
  storeId: string;
  role: UserRole;
  store: Store;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
}

export interface AddUserToStoreDto {
  userId: string;
  storeId: string;
  role: UserRole;
}

/** For POST /user/register */
export interface RegisterUserData {
  id: string;
  email: string;
}

/** For POST /user/add-to-store */
export interface AddUserToStoreData {
  id: string;
  userId: string;
  storeId: string;
  role: string;
}

/** For GET /user/{id}/stores */
export interface UserStoreRole {
  id: string;
  userId: string;
  storeId: string;
  role: string;
}

/** For GET /user/me */
export interface CurrentUserData {
  id: string;
  email: string;
  name: string;
  userStores: UserStore[];
  selectedStoreRole: UserRole | null;
}
