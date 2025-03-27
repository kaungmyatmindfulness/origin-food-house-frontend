"use client";

import React from "react";
import { cn } from "@repo/ui/lib/utils";
import { UserStore } from "@/features/user/types/user.types";

interface StoreCardProps {
	userStore: UserStore;
	onSelect: (storeId: number) => void;
}

export const StoreCard: React.FC<StoreCardProps> = ({
	userStore,
	onSelect,
}) => {
	const { store, role } = userStore;

	return (
		<li>
			<button
				type="button"
				onClick={() => onSelect(store.id)}
				className={cn(
					"w-full p-4 border rounded-lg shadow-sm bg-white hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer",
					"text-left"
				)}
				aria-label={`Select store ${store.name}, role ${role}`}
			>
				<div className="mb-2">
					<h3 className="text-lg font-semibold">{store.name}</h3>
					{store.address && (
						<p className="text-sm text-gray-600">{store.address}</p>
					)}
					{store.phone && (
						<p className="text-sm text-gray-600">{store.phone}</p>
					)}
				</div>
				<div className="mt-2">
					<span className="text-xs font-medium text-indigo-600 uppercase">
						{role}
					</span>
				</div>
			</button>
		</li>
	);
};
