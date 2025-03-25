"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

import { useAuthStore } from "@pos/features/auth/store/auth.store";

const loginSchema = z.object({
	email: z.string().email("Please enter a valid email address."),
	password: z.string().min(6, "Password must be at least 6 characters."),
});
type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
	const router = useRouter();
	const { loginAction, isAuthenticated, loading, error } = useAuthStore();

	// Initialize React Hook Form with Zod
	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	// If already authenticated, redirect to choose shop
	// useEffect(() => {
	// 	if (isAuthenticated) {
	// 		router.replace("/choose-shop");
	// 	}
	// }, [isAuthenticated, router]);

	async function onSubmit(data: LoginFormValues) {
		await loginAction(data.email, data.password);
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				{/* Email Field */}
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

				{/* Password Field */}
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

				{/* Display store error if any (e.g., invalid credentials) */}
				{error && <p className="text-sm text-red-600">{error}</p>}

				<Button type="submit" disabled={loading} className="w-full mt-2">
					{loading ? "Logging in..." : "Login"}
				</Button>

				{/* Forgot password link */}
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
