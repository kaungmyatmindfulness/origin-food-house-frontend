"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Button } from "@repo/ui/components/button";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { login } from "@/features/auth/services/auth.service";
import { getCurrentUser } from "@/features/user/services/user.service";

import { useMutation, useQuery } from "@tanstack/react-query";

const loginSchema = z.object({
	email: z.string().email("Please enter a valid email address."),
	password: z.string().min(6, "Password must be at least 6 characters."),
});
type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
	const router = useRouter();
	const { accessToken, setAuth } = useAuthStore();

	// React Query: fetch current user data when token exists
	const {
		data: user,
		isLoading: isUserLoading,
		error: userError,
	} = useQuery({
		queryKey: ["user", "me"],
		queryFn: () => getCurrentUser(),
		enabled: !!accessToken,
	});
	console.log("📝 -> LoginPage -> user:", user);

	// React Query: login mutation
	const loginMutation = useMutation({
		mutationFn: login,
	});

	// Form setup using React Hook Form + Zod
	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	// Handle login submission
	async function onSubmit(values: LoginFormValues) {
		try {
			const response = await loginMutation.mutateAsync(values);
			// Set the auth token; if your response includes additional user data, pass it along
			setAuth(response.data.access_token);
		} catch (error) {
			console.error("Login failed:", error);
			// Optionally, you could use a toast or set a local error state here.
		}
	}

	// Redirect based on authentication and user data
	useEffect(() => {
		if (!accessToken) return;
		if (isUserLoading) return; // wait until the user query finishes
		if (userError) return; // handle error separately if needed

		// Once user data is available, redirect accordingly:
		// If user has currentStore defined, go to "/sale"
		// Else if user has userStores available, go to "/choose-store"
		// Otherwise, redirect to "/create-store"
		if (user?.currentStore) {
			router.replace("/sale");
		} else if (user?.userStores?.length) {
			router.replace("/choose-store");
		} else {
			router.replace("/create-store");
		}
	}, [accessToken, isUserLoading, user, userError, router]);

	// Determine button loading state
	const isLoading = loginMutation.isPending || isUserLoading;

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input placeholder="you@example.com" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Password</FormLabel>
							<FormControl>
								<Input type="password" placeholder="********" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Show mutation error if any */}
				{loginMutation.error && (
					<p className="text-sm text-red-600">
						{(loginMutation.error as Error).message}
					</p>
				)}

				<Button type="submit" disabled={isLoading} className="w-full mt-2">
					{isLoading ? "Logging in..." : "Login"}
				</Button>

				<p className="mt-4 text-sm text-center text-gray-600">
					Forgot your password?{" "}
					<Link
						href="/(auth)/forgot-password"
						className="font-medium text-indigo-700 hover:underline"
					>
						Reset here
					</Link>
				</p>
			</form>
		</Form>
	);
}
