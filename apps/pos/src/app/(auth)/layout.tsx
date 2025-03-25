import Image from "next/image";
import React from "react";

export const metadata = {
	title: "Auth",
};

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400">
			<div className="flex flex-col w-full max-w-md p-8 bg-white rounded-lg shadow-xl bg-opacity-90">
				{/* HEADER */}
				<header className="mb-6 text-center">
					<div className="flex flex-col items-center">
						{/* Update with your own logo path */}
						<Image src="/logo.svg" alt="App Logo" width={128} height={64} />
					</div>
					{/* You can optionally pass a dynamic message from each page, 
              but here we keep a static or generic heading. */}
					<p className="text-gray-600">Please sign in or register</p>
				</header>

				{/* The actual page content */}
				{children}

				{/* FOOTER */}
				<footer className="pt-4 mt-6 text-center text-gray-600 border-t border-gray-300">
					<p className="text-xs">
						&copy; {new Date().getFullYear()} Origin Food House. All rights
						reserved.
					</p>
				</footer>
			</div>
		</div>
	);
}
