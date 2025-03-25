import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import {
	login,
	chooseShop,
	registerUser,
	forgotPassword,
	resetPassword,
} from "../services/auth.service";
import { User } from "../types";

interface AuthState {
	accessToken: string | null;
	user: User | null;
	isAuthenticated: boolean;

	loading: boolean;
	error: string | null;

	// Actions
	loginAction: (email: string, password: string) => Promise<void>;
	chooseShopAction: (shopId: number) => Promise<void>;
	registerAction: (
		email: string,
		password: string,
		name?: string
	) => Promise<void>;
	forgotPasswordAction: (email: string) => Promise<void>;
	resetPasswordAction: (token: string, newPassword: string) => Promise<void>;
	logout: () => void;
}

// If your Zustand version supports it, you can do:
export const useAuthStore = create<AuthState>()(
	devtools(
		persist(
			immer<AuthState>((set, get) => ({
				accessToken: null,
				user: null,
				isAuthenticated: false,
				loading: false,
				error: null,

				async loginAction(email, password) {
					set((state) => {
						state.loading = true;
						state.error = null;
					});
					try {
						const response = await login({ email, password });
						console.log("📝 -> loginAction -> response:", response);
						set((state) => {
							state.accessToken = response.data.access_token;
							state.isAuthenticated = true;
						});
					} catch (err) {
						set((state) => {
							state.error = (err as Error).message;
						});
					} finally {
						set((state) => {
							state.loading = false;
						});
					}
				},

				async chooseShopAction(shopId) {
					set((state) => {
						state.loading = true;
						state.error = null;
					});
					try {
						const response = await chooseShop({ shopId });
						set((state) => {
							state.accessToken = response.data.access_token;
							state.isAuthenticated = true;
						});
					} catch (err) {
						set((state) => {
							state.error = (err as Error).message;
						});
					} finally {
						set((state) => {
							state.loading = false;
						});
					}
				},

				async registerAction(email, password, name) {
					set((state) => {
						state.loading = true;
						state.error = null;
					});
					try {
						await registerUser({ email, password, name });
						// Possibly auto-login or redirect
					} catch (err) {
						set((state) => {
							state.error = (err as Error).message;
						});
					} finally {
						set((state) => {
							state.loading = false;
						});
					}
				},

				async forgotPasswordAction(email) {
					set((state) => {
						state.loading = true;
						state.error = null;
					});
					try {
						await forgotPassword(email);
					} catch (err) {
						set((state) => {
							state.error = (err as Error).message;
						});
					} finally {
						set((state) => {
							state.loading = false;
						});
					}
				},

				async resetPasswordAction(token, newPassword) {
					set((state) => {
						state.loading = true;
						state.error = null;
					});
					try {
						await resetPassword(token, newPassword);
					} catch (err) {
						set((state) => {
							state.error = (err as Error).message;
						});
					} finally {
						set((state) => {
							state.loading = false;
						});
					}
				},

				logout() {
					set((state) => {
						state.accessToken = null;
						state.user = null;
						state.isAuthenticated = false;
						state.error = null;
					});
				},
			})),
			{ name: "auth-store" }
		)
	)
);
