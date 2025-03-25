/** Request payload for /auth/login */
export interface LoginDto {
	email: string;
	password: string;
}

/** Response data from /auth/login or /auth/login/shop */
export interface AccessTokenData {
	access_token: string;
}

/** Request payload for /auth/login/shop */
export interface ChooseShopDto {
	shopId: number;
}

/** Request payload for /user/register */
export interface CreateUserDto {
	email: string;
	password: string;
	name?: string;
}

/** Response data from /user/register */
export interface RegisteredUserData {
	id: number;
	email: string;
}

/** Example user model (e.g. from /user/me or user data) */
export interface User {
	id: number;
	email: string;
}
