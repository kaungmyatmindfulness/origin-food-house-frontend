export interface LoginDto {
	email: string;
	password: string;
}

export interface ChooseStoreDto {
	storeId: number;
}

export interface ForgotPasswordDto {
	email: string;
}

export interface ResetPasswordDto {
	token: string;
	newPassword: string;
}

export interface ChangePasswordDto {
	oldPassword: string;
	newPassword: string;
}

export interface AccessTokenData {
	access_token: string;
}
