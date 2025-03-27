"use client";

import React from "react";
import { motion } from "framer-motion";
import { StoreCard } from "@/features/store/components/store-card";
import { UserStore } from "@/features/user/types/user.types";

interface StoreListProps {
	userStores: UserStore[];
	onSelect: (storeId: number) => void;
}

export function StoreList({ userStores, onSelect }: StoreListProps) {
	return (
		<motion.ul
			role="list"
			className="grid grid-cols-1 gap-6 sm:grid-cols-2"
			// AnimatePresence won't apply here by default unless we do more advanced toggling
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.3 } }}
			transition={{ duration: 0.3 }}
		>
			{userStores.map((userStore) => (
				<StoreCard
					key={userStore.id}
					userStore={userStore}
					onSelect={onSelect}
				/>
			))}
		</motion.ul>
	);
}
