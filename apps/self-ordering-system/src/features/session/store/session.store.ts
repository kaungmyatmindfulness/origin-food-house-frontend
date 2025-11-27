import type { JoinSessionResponse } from '@/features/session/types/session.types';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface SessionInfoState {
  sessionId: string | null;
  tableId: string | null;
  storeId: string | null;
  sessionToken: string | null;
  storeSlug: string | null;
}

interface SessionInfoActions {
  setSessionInfo: (data: JoinSessionResponse) => void;
  clearSessionInfo: () => void;
}

export const useSessionInfoStore = create<
  SessionInfoState & SessionInfoActions
>()(
  immer((set) => ({
    sessionId: null,
    tableId: null,
    storeId: null,
    sessionToken: null,
    storeSlug: null,

    setSessionInfo: (data) => {
      set((state) => {
        state.sessionId = data.sessionId;
        state.tableId = data.tableId;
        state.storeId = data.storeId;
        state.sessionToken = data.sessionToken;
        state.storeSlug = data.storeSlug ?? null;
      });
    },

    clearSessionInfo: () => {
      set((state) => {
        state.sessionId = null;
        state.tableId = null;
        state.storeId = null;
        state.sessionToken = null;
        state.storeSlug = null;
      });
    },
  }))
);

// Selectors
export const selectSessionId = (state: SessionInfoState) => state.sessionId;
export const selectTableId = (state: SessionInfoState) => state.tableId;
export const selectStoreId = (state: SessionInfoState) => state.storeId;
export const selectSessionToken = (state: SessionInfoState) =>
  state.sessionToken;
export const selectStoreSlug = (state: SessionInfoState) => state.storeSlug;
