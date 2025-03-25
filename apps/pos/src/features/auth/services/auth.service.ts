import { ApiResponse } from "@pos/common/types/api";
import { apiFetch } from "@pos/utils/apiFetch"; // or "@pos/utils/apiFetch" if you set that path

import {
	AccessTokenData,
	ChooseShopDto,
	CreateUserDto,
	LoginDto,
	RegisteredUserData,
} from "../types";

/** Step 1: Login with email/password -> returns { access_token } */
export async function login(
	data: LoginDto
): Promise<ApiResponse<AccessTokenData>> {
	return apiFetch<AccessTokenData>("/auth/login", {
		method: "POST",
		body: JSON.stringify(data),
	});
}

/** Step 2: Choose a shop -> returns new token with { shopId, role } inside access_token */
export async function chooseShop(
	data: ChooseShopDto
): Promise<ApiResponse<AccessTokenData>> {
	return apiFetch<AccessTokenData>("/auth/login/shop", {
		method: "POST",
		body: JSON.stringify(data),
	});
}

/** Register -> returns { id, email } */
export async function registerUser(
	data: CreateUserDto
): Promise<ApiResponse<RegisteredUserData>> {
	return apiFetch<RegisteredUserData>("/user/register", {
		method: "POST",
		body: JSON.stringify(data),
	});
}

/** Forgot password -> returns success/fail with data = null */
export async function forgotPassword(
	email: string
): Promise<ApiResponse<null>> {
	return apiFetch<null>("/auth/forgot-password", {
		method: "POST",
		body: JSON.stringify({ email }),
	});
}

/** Reset password -> returns success/fail with data = null */
export async function resetPassword(
	token: string,
	newPassword: string
): Promise<ApiResponse<null>> {
	return apiFetch<null>("/auth/reset-password", {
		method: "POST",
		body: JSON.stringify({ token, newPassword }),
	});
}
