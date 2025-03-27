"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";

export const StoreCardSkeleton: React.FC = () => {
	return (
		<motion.li
			className="list-none"
			// Optionally you can define initial/animate/exit for each item
		>
			<div
				className={cn(
					"w-full p-4 border rounded-lg shadow-sm bg-white flex flex-col"
				)}
				aria-hidden="true"
			>
				{/* Mimic store name */}
				<Skeleton className="w-3/4 h-6 mb-2" />
				{/* Mimic store address */}
				<Skeleton className="w-5/6 h-4 mb-1" />
				{/* Mimic store phone */}
				<Skeleton className="w-1/2 h-4" />
				{/* Mimic role badge */}
				<div className="mt-4">
					<Skeleton className="w-1/3 h-4" />
				</div>
			</div>
		</motion.li>
	);
};

StoreCardSkeleton.displayName = "StoreCardSkeleton";
