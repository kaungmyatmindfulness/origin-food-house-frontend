import { apiFetch } from '@/utils/apiFetch';
import { BaseApiResponse } from '@/common/types/api.types';
import {
  LoginDto,
  ChooseStoreDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  AccessTokenData,
} from '../types/auth.types';

/** POST /auth/login (Step 1) */
export async function login(
  data: LoginDto
): Promise<BaseApiResponse<AccessTokenData>> {
  const res = await apiFetch<AccessTokenData>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res; // The entire { status, data, message, error }
}

/** POST /auth/login/store (Step 2) */
export async function loginWithStore(
  data: ChooseStoreDto
): Promise<BaseApiResponse<AccessTokenData>> {
  const res = await apiFetch<AccessTokenData>('/auth/login/store', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (res.data === null) {
    throw new Error('Store log in failed');
  }
  return res;
}

/** GET /auth/verify?token=xyz */
export async function verifyEmail(
  token: string
): Promise<BaseApiResponse<null>> {
  const res = await apiFetch<null>(
    `/auth/verify?token=${encodeURIComponent(token)}`
  );
  return res;
}

/** POST /auth/forgot-password */
export async function forgotPassword(
  data: ForgotPasswordDto
): Promise<BaseApiResponse<null>> {
  const res = await apiFetch<null>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res;
}

/** POST /auth/reset-password */
export async function resetPassword(
  data: ResetPasswordDto
): Promise<BaseApiResponse<null>> {
  const res = await apiFetch<null>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res;
}

/** POST /auth/change-password (logged in) */
export async function changePassword(
  data: ChangePasswordDto
): Promise<BaseApiResponse<null>> {
  const res = await apiFetch<null>('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res;
}
