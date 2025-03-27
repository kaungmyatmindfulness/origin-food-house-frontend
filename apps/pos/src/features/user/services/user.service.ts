import {
	CreateUserDto,
	AddUserToStoreDto,
	RegisterUserData,
	AddUserToStoreData,
	UserStoreRole,
	CurrentUserData,
} from "@/features/user/types/user.types";
import { apiFetch } from "@/utils/apiFetch";

/** POST /user/register */
export async function registerUser(
	data: CreateUserDto
): Promise<RegisterUserData> {
	const res = await apiFetch<RegisterUserData>("/user/register", {
		method: "POST",
		body: JSON.stringify(data),
	});
	if (res.status === "error") {
		throw new Error(res.error?.message || res.message || "Registration failed");
	}
	return res.data;
}

/** POST /user/add-to-store */
export async function addUserToStore(
	data: AddUserToStoreDto
): Promise<AddUserToStoreData> {
	const res = await apiFetch<AddUserToStoreData>("/user/add-to-store", {
		method: "POST",
		body: JSON.stringify(data),
	});
	if (res.status === "error") {
		throw new Error(
			res.error?.message || res.message || "Add user to store failed"
		);
	}
	return res.data;
}

/** GET /user/{id}/stores */
export async function getUserStores(userId: number): Promise<UserStoreRole[]> {
	const res = await apiFetch<UserStoreRole[]>(`/user/${userId}/stores`);
	if (res.status === "error") {
		throw new Error(
			res.error?.message || res.message || "Failed to get user stores"
		);
	}
	return res.data;
}

/** GET /user/me */
export async function getCurrentUser(): Promise<CurrentUserData> {
	const res = await apiFetch<CurrentUserData>("/user/me");
	if (res.status === "error") {
		throw new Error(
			res.error?.message || res.message || "Failed to get current user"
		);
	}
	return res.data;
}
