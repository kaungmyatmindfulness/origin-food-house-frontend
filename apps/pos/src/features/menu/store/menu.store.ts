import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface MenuState {
  editMenuItemId: string | null;
}

interface MenuActions {
  setEditMenuItemId: (itemId: string | null) => void;
}

const initialState: MenuState = {
  editMenuItemId: null,
};

export const useMenuStore = create<MenuState & MenuActions>()(
  devtools(
    immer((set) => ({
      ...initialState,
      setEditMenuItemId: (itemId) =>
        set((draft) => {
          draft.editMenuItemId = itemId;
        }),
    })),
    {
      name: 'menu-ui-store',
    }
  )
);

export const selectEditMenuItemId = (state: MenuState & MenuActions) =>
  state.editMenuItemId;
