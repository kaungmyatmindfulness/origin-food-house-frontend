import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";

export default function HomePage() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-white px-6">
			<div className="max-w-3xl text-center space-y-6">
				<h1 className="text-5xl font-extrabold text-indigo-900">
					Welcome to MyApp
				</h1>
				<p className="text-lg text-indigo-700">
					A modern starter built with Next.js, Tailwind CSS, and shadcn/ui for
					rapid development.
				</p>
				<Button size="lg">Get Started</Button>
			</div>

			<section className="mt-16 w-full max-w-md">
				<Card className="shadow-xl">
					<CardContent className="space-y-4">
						<h2 className="text-2xl font-semibold">Key Features</h2>
						<ul className="list-disc list-inside text-indigo-600 space-y-2">
							<li>Next.js App Router + TypeScript</li>
							<li>Responsive Tailwind layouts</li>
							<li>Accessible UI components (shadcn/ui)</li>
							<li>Dark mode ready</li>
						</ul>
					</CardContent>
				</Card>
			</section>

			<footer className="mt-20 text-sm text-gray-500">
				© {new Date().getFullYear()} MyApp. All rights reserved.
			</footer>
		</main>
	);
}
