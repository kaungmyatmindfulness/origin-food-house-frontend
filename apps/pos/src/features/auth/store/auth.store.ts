import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { CurrentUserData } from '@/features/user/types/user.types';

interface AuthState {
  accessToken: string | null;
  user: CurrentUserData | null;
  selectedStoreId: number | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  setAuth: (token: string | null) => void;
  setUser: (user: CurrentUserData | null) => void;
  setSelectedStore: (storeId: number | null) => void;
  clearAuth: () => void;
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
  selectedStoreId: null,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    persist(
      immer((set) => ({
        ...initialState,

        setAuth: (token) =>
          set((draft) => {
            draft.accessToken = token;
            draft.isAuthenticated = !!token;
          }),

        setUser: (user) =>
          set((draft) => {
            draft.user = user;
          }),

        setSelectedStore: (storeId) =>
          set((draft) => {
            draft.selectedStoreId = storeId;
          }),

        clearAuth: () =>
          set((draft) => {
            draft.accessToken = null;
            draft.user = null;
            draft.selectedStoreId = null;
            draft.isAuthenticated = false;
          }),
      })),

      {
        name: 'auth-storage',
      }
    ),

    {
      name: 'auth-store',
    }
  )
);

export const selectIsAuthenticated = (state: AuthState) =>
  state.isAuthenticated;
export const selectUser = (state: AuthState) => state.user;
export const selectSelectedStoreId = (state: AuthState) =>
  state.selectedStoreId;
export const selectAccessToken = (state: AuthState) => state.accessToken;
