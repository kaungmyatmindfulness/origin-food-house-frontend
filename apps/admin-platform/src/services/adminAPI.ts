const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'An error occurred',
    }));
    throw new Error(error.message || 'API request failed');
  }

  const json = await response.json();
  return json.data || json;
}

export interface ListStoresQuery {
  page?: number;
  limit?: number;
  status?: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  tier?: 'FREE' | 'STANDARD' | 'PREMIUM';
  search?: string;
}

export interface ListUsersQuery {
  page?: number;
  limit?: number;
  status?: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  search?: string;
}

export interface GetPaymentQueueQuery {
  page?: number;
  limit?: number;
  status?: 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED';
}

export interface PaymentRequestDto {
  id: string;
  storeId: string;
  storeName: string;
  tier: string;
  amount: string;
  paymentProofUrl: string;
  status: string;
  createdAt: string;
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
  };
}

export interface StoreDto {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreDetailDto extends StoreDto {
  subscriptionStatus?: string;
  suspensionHistory?: Array<{
    id: string;
    reason: string;
    suspendedAt: string;
    suspendedBy: string;
  }>;
  analytics?: {
    totalRevenue: string;
    totalOrders: number;
    activeUsers: number;
  };
}

export interface UserDetailDto extends UserDto {
  stores: Array<{
    storeId: string;
    storeName: string;
    role: string;
  }>;
  suspensionHistory?: Array<{
    id: string;
    reason: string;
    scope: 'PLATFORM' | 'STORE';
    suspendedAt: string;
  }>;
  activityTimeline?: Array<{
    id: string;
    action: string;
    timestamp: string;
  }>;
}

export const adminAPI = {
  listStores: async (query: ListStoresQuery) => {
    const params = new URLSearchParams(
      Object.entries(query)
        .filter(([, v]) => v != null)
        .map(([k, v]) => [k, String(v)])
    );
    return apiFetch<{ stores: StoreDto[]; total: number }>(
      `/admin/stores?${params}`
    );
  },

  getStoreDetail: async (storeId: string) => {
    return apiFetch<StoreDetailDto>(`/admin/stores/${storeId}`);
  },

  suspendStore: async (storeId: string, reason: string) => {
    return apiFetch(`/admin/stores/${storeId}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  banStore: async (storeId: string, reason: string) => {
    return apiFetch(`/admin/stores/${storeId}/ban`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  reactivateStore: async (storeId: string) => {
    return apiFetch(`/admin/stores/${storeId}/reactivate`, {
      method: 'POST',
    });
  },

  listUsers: async (query: ListUsersQuery) => {
    const params = new URLSearchParams(
      Object.entries(query)
        .filter(([, v]) => v != null)
        .map(([k, v]) => [k, String(v)])
    );
    return apiFetch<{ users: UserDto[]; total: number }>(
      `/admin/users?${params}`
    );
  },

  getUserDetail: async (userId: string) => {
    return apiFetch<UserDetailDto>(`/admin/users/${userId}`);
  },

  suspendUser: async (
    userId: string,
    reason: string,
    scope: 'PLATFORM' | 'STORE',
    storeId?: string
  ) => {
    return apiFetch(`/admin/users/${userId}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason, scope, storeId }),
    });
  },

  banUser: async (
    userId: string,
    reason: string,
    scope: 'PLATFORM' | 'STORE',
    storeId?: string
  ) => {
    return apiFetch(`/admin/users/${userId}/ban`, {
      method: 'POST',
      body: JSON.stringify({ reason, scope, storeId }),
    });
  },

  reactivateUser: async (userId: string) => {
    return apiFetch(`/admin/users/${userId}/reactivate`, {
      method: 'POST',
    });
  },

  resetUserPassword: async (userId: string) => {
    return apiFetch(`/admin/users/${userId}/password-reset`, {
      method: 'POST',
    });
  },

  getPaymentQueue: async (query: GetPaymentQueueQuery) => {
    const params = new URLSearchParams(
      Object.entries(query)
        .filter(([, v]) => v != null)
        .map(([k, v]) => [k, String(v)])
    );
    return apiFetch<{ payments: PaymentRequestDto[]; total: number }>(
      `/admin/payments?${params}`
    );
  },

  getPaymentDetail: async (paymentId: string) => {
    return apiFetch<PaymentRequestDto>(`/admin/payments/${paymentId}`);
  },

  verifyPayment: async (paymentId: string) => {
    return apiFetch(`/admin/payments/${paymentId}/verify`, {
      method: 'POST',
    });
  },

  rejectPayment: async (paymentId: string, reason: string) => {
    return apiFetch(`/admin/payments/${paymentId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejectionReason: reason }),
    });
  },
};
