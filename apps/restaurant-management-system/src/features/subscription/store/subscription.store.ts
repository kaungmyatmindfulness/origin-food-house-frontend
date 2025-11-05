import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  Subscription,
  PaymentRequest,
  PaymentStatus,
} from '../types/subscription.types';

interface SubscriptionState {
  subscription: Subscription | null;
  paymentRequests: PaymentRequest[];
}

interface SubscriptionActions {
  setSubscription: (subscription: Subscription) => void;
  addPaymentRequest: (request: PaymentRequest) => void;
  updatePaymentRequestStatus: (id: string, status: PaymentStatus) => void;
  clearSubscription: () => void;
}

const initialState: SubscriptionState = {
  subscription: null,
  paymentRequests: [],
};

export const useSubscriptionStore = create<
  SubscriptionState & SubscriptionActions
>()(
  devtools(
    persist(
      immer((set) => ({
        ...initialState,

        setSubscription: (subscription) =>
          set((draft) => {
            draft.subscription = subscription;
          }),

        addPaymentRequest: (request) =>
          set((draft) => {
            draft.paymentRequests.push(request);
          }),

        updatePaymentRequestStatus: (id, status) =>
          set((draft) => {
            const request = draft.paymentRequests.find((r) => r.id === id);
            if (request) {
              request.status = status;
            }
          }),

        clearSubscription: () =>
          set((draft) => {
            draft.subscription = null;
            draft.paymentRequests = [];
          }),
      })),
      {
        name: 'subscription-storage',
        partialize: (state) => ({
          subscription: state.subscription,
        }),
      }
    ),
    { name: 'subscription-store' }
  )
);

export const selectSubscription = (state: SubscriptionState) =>
  state.subscription;
export const selectPaymentRequests = (state: SubscriptionState) =>
  state.paymentRequests;
