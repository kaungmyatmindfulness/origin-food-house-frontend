import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  AdminState,
  AdminActions,
  AdminProfile,
} from '@/types/admin.types';

const initialState: AdminState = {
  adminProfile: null,
  permissions: [],
};

export const useAdminStore = create<AdminState & AdminActions>()(
  devtools(
    persist(
      immer((set) => ({
        ...initialState,

        setAdminProfile: (profile: AdminProfile | null) =>
          set((draft) => {
            draft.adminProfile = profile;
          }),

        setPermissions: (permissions: string[]) =>
          set((draft) => {
            draft.permissions = permissions;
          }),

        clearAdmin: () =>
          set((draft) => {
            draft.adminProfile = null;
            draft.permissions = [];
          }),
      })),
      {
        name: 'admin-storage',
        partialize: (state) => ({
          adminProfile: state.adminProfile,
          permissions: state.permissions,
        }),
      }
    ),
    { name: 'admin-store' }
  )
);

export const selectAdminProfile = (state: AdminState & AdminActions) =>
  state.adminProfile;
export const selectPermissions = (state: AdminState & AdminActions) =>
  state.permissions;
