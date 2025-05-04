// src/features/menu/components/menu-header.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@repo/ui/components/avatar';
import { Button } from '@repo/ui/components/button';
import { Sheet, SheetTrigger } from '@repo/ui/components/sheet';
import { Phone, Menu as MenuIcon } from 'lucide-react';
import { noop } from 'lodash-es';
// Assuming CartSheetContent is moved to the cart feature with kebab-case

interface MenuHeaderProps {
  show: boolean;
  storeName: string;
  storeLogo?: string | null;
}

export function MenuHeader({ show, storeName, storeLogo }: MenuHeaderProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="sticky top-0 z-40 bg-white shadow-md"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'tween', duration: 0.3 }}
        >
          <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
            {/* Store Info */}
            <div className="flex items-center gap-3 overflow-hidden">
              <Avatar>
                <AvatarImage
                  src={storeLogo ?? undefined}
                  alt={`${storeName} logo`}
                />
                <AvatarFallback>{storeName.charAt(0)}</AvatarFallback>
              </Avatar>
              <h1 className="truncate text-xl font-semibold">{storeName}</h1>
            </div>
            {/* Action Buttons */}
            <div className="flex flex-shrink-0 items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                aria-label="Call Server"
                onClick={noop}
              >
                <Phone className="h-4 w-4" />
              </Button>
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="relative"
                    aria-label="View Ordered Items"
                  >
                    <MenuIcon className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                {/* Render CartSheetContent (imported from cart feature) */}
              </Sheet>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
