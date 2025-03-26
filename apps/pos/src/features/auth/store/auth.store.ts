import { CurrentUserData } from "@/features/user/types/user.types";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface AuthState {
	accessToken: string | null;
	user: CurrentUserData | null;
	isAuthenticated: boolean;

	setAuth: (token: string) => void;
	setUser: (user: CurrentUserData) => void;
	clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
	devtools(
		persist(
			(set) => ({
				accessToken: null,
				user: null,
				storeId: null,
				stores: [],
				isAuthenticated: false,

				setAuth: (token) =>
					set(() => ({
						accessToken: token,
						isAuthenticated: true,
					})),

				setUser: (user) =>
					set(() => ({
						user,
					})),

				clearAuth: () =>
					set(() => ({
						accessToken: null,
						user: null,
						storeId: null,
						stores: [],
						isAuthenticated: false,
					})),
			}),
			{ name: "auth-storage" }
		)
	)
);
