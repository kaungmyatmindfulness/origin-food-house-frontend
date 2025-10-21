'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBasket } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { scroller } from 'react-scroll';

import { CartSheetContent } from '@/features/cart/components/cart-sheet-content'; // Adjust path if needed

import { CartItem } from '@/features/cart/types/cart.types'; // Adjust path
import { CustomizationDialog } from '@/features/menu/components/customization-dialog';
import { MenuCategorySection } from '@/features/menu/components/menu-category-section';
import { MenuControls } from '@/features/menu/components/menu-controls';
import { MenuHeader } from '@/features/menu/components/menu-header';
import { MenuSkeleton } from '@/features/menu/components/menu-skeleton';
import { useStickyHeader } from '@/features/menu/hooks/useStickyHeader';
import { MOCK_CATEGORIES, MOCK_STORE_DETAILS } from '@/features/menu/mocks'; // Keep mocks for now
import { Category, MenuItem } from '@/features/menu/types/menu.types'; // Adjust path
import { formatCurrency } from '@/utils/formatting'; // Adjust path
import { Button } from '@repo/ui/components/button'; // Adjust path
import { Sheet, SheetTrigger } from '@repo/ui/components/sheet'; // Adjust path
import { useCartStore } from '@/features/cart/store/cart.store';
import { toast } from 'sonner';

export default function RestaurantMenuPage() {
  const params = useParams();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _slug = params.slug as string; // Reserved for future use

  // const categories =

  // --- Component State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [customizationItem, setCustomizationItem] = useState<MenuItem | null>(
    null
  );

  // --- Zustand Store Integration ---
  // const {
  //   cart,
  //   optimisticAddItem,
  //   optimisticUpdateItem,
  //   optimisticRemoveItem,
  //   optimisticClearCart,
  // } = useCartStore((state) => ({ // The result of getServerSnapshot should be cached to avoid an infinite loop
  //   cart: state.cart,
  //   optimisticAddItem: state.optimisticAddItem,
  //   optimisticUpdateItem: state.optimisticUpdateItem,
  //   optimisticRemoveItem: state.optimisticRemoveItem,
  //   optimisticClearCart: state.optimisticClearCart,
  // }));
  const cart = useCartStore((state) => state.cart);
  const optimisticAddItem = useCartStore((state) => state.optimisticAddItem);
  const optimisticUpdateItem = useCartStore(
    (state) => state.optimisticUpdateItem
  );
  const optimisticRemoveItem = useCartStore(
    (state) => state.optimisticRemoveItem
  );
  const optimisticClearCart = useCartStore(
    (state) => state.optimisticClearCart
  );

  // --- Header Logic ---
  const showStickyHeader = useStickyHeader();

  // --- Derived Cart State ---
  const cartItems = useMemo(() => cart?.items ?? [], [cart]);
  const cartItemsMap = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => {
        // Use actual cart item ID if available, otherwise temp ID (less reliable for mapping)
        const key = item.menuItem.id ?? item.id; // Prioritize menuItemId if available and stable
        acc[key] = item;
        return acc;
      },
      {} as Record<string, CartItem>
    );
  }, [cartItems]);

  const cartItemCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const cartTotal = useMemo(() => {
    // Calculate total based on potentially optimistic state
    return cartItems.reduce((sum, cartItem) => {
      // Ensure menuItem exists and basePrice is valid before parsing
      const basePrice = parseFloat(cartItem.menuItem?.basePrice ?? '0');
      let customizationPrice = 0;
      if (cartItem.selectedOptions) {
        customizationPrice = cartItem.selectedOptions.reduce((optSum, opt) => {
          // Ensure additionalPrice is valid before parsing
          return optSum + parseFloat(opt.additionalPrice?.toString() ?? '0'); // API uses number, spec uses string|null
        }, 0);
      }
      return sum + (basePrice + customizationPrice) * cartItem.quantity;
    }, 0);
  }, [cartItems]);

  // --- Data Fetching (Replace Mocks) ---
  // TODO: Replace mocks with actual data fetching (e.g., using React Query)
  const categoriesData: Category[] = MOCK_CATEGORIES;
  const storeDetails = MOCK_STORE_DETAILS;
  const isLoadingCategories = false; // Replace with React Query loading state
  const categoriesError = null; // Replace with React Query error state

  // --- Store Details ---
  const storeName = storeDetails?.information?.name ?? 'Loading...';
  const storeLogo = storeDetails?.information?.logoUrl;
  const storeCurrency = storeDetails?.setting?.currency ?? 'USD'; // Default currency

  // --- Event Handlers ---

  const handleApiError = (action: string, error: unknown) => {
    console.error(`Error during ${action}:`, error);
    toast.error(`Failed to ${action}. Please try again.`);
  };

  const handleCustomize = (item: MenuItem) => {
    // Open customization dialog
    setCustomizationItem(item);
  };

  // TODO: Implement this function in CustomizationDialog and pass it down or lift state up
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleAddCustomizedItem = (item: CartItem) => {
    // The item passed from dialog should already have quantity, notes, selectedOptions etc.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, cartId: _cartId, createdAt: _createdAt, updatedAt: _updatedAt, ...payload } = item; // Omit generated fields
    optimisticAddItem(payload).catch((err) =>
      handleApiError('add customized item', err)
    );
    setCustomizationItem(null); // Close dialog
  };

  const handleIncrement = (
    cartItemId: string | undefined,
    menuItemId: string | undefined // Use menuItemId to find the item in the map
  ) => {
    if (!menuItemId) return;
    const currentItem = cartItemsMap[menuItemId];
    if (!currentItem) return;

    // Construct the updated CartItem payload
    const updatedItemPayload: CartItem = {
      ...currentItem,
      quantity: currentItem.quantity + 1,
      // id is required by the optimisticUpdateItem payload type
      id: currentItem.id, // Ensure the correct ID is passed
    };

    optimisticUpdateItem(updatedItemPayload).catch((err) =>
      handleApiError('increase quantity', err)
    );
  };

  const handleDecrement = (
    cartItemId: string | undefined,
    menuItemId: string | undefined // Use menuItemId to find the item in the map
  ) => {
    if (!menuItemId) return;
    const currentItem = cartItemsMap[menuItemId];
    if (!currentItem) return;

    if (currentItem.quantity > 1) {
      // Construct the updated CartItem payload
      const updatedItemPayload: CartItem = {
        ...currentItem,
        quantity: currentItem.quantity - 1,
        // id is required by the optimisticUpdateItem payload type
        id: currentItem.id, // Ensure the correct ID is passed
      };
      optimisticUpdateItem(updatedItemPayload).catch((err) =>
        handleApiError('decrease quantity', err)
      );
    } else {
      // Remove item if quantity becomes 0
      optimisticRemoveItem(currentItem.id).catch((err) =>
        handleApiError('remove item', err)
      );
    }
  };

  const handleRemoveItem = (cartItemId: string | undefined) => {
    if (!cartItemId) return;
    optimisticRemoveItem(cartItemId).catch((err) =>
      handleApiError('remove item', err)
    );
  };

  const handleClearCart = () => {
    console.log('UI Action: Clear Cart');
    optimisticClearCart().catch((err) => handleApiError('clear cart', err));
  };

  const handleCategorySelect = (categoryId: string) => {
    scroller.scrollTo(categoryId, {
      duration: 800,
      delay: 0,
      smooth: 'easeInOutQuart',
      offset: -150, // Adjust offset based on sticky header height
    });
  };

  // --- Filtering Logic ---
  const filteredCategories = useMemo(() => {
    if (!categoriesData) return [];
    if (!searchTerm.trim()) return categoriesData;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return categoriesData
      .map((category) => ({
        ...category,
        menuItems: category.menuItems?.filter(
          (item) =>
            item.name.toLowerCase().includes(lowerCaseSearchTerm) ||
            item.description?.toLowerCase().includes(lowerCaseSearchTerm)
        ),
      }))
      .filter(
        (category) => category.menuItems && category.menuItems.length > 0
      );
  }, [categoriesData, searchTerm]);

  // --- Render Logic ---
  if (isLoadingCategories) {
    return <MenuSkeleton storeName={storeName} />;
  }
  if (categoriesError) {
    return (
      <div className="text-destructive container mx-auto px-4 py-8">
        Error loading categories: {(categoriesError as Error).message}
      </div>
    );
  }
  if (!categoriesData || categoriesData.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        No menu categories found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- Header --- */}
      <MenuHeader
        show={showStickyHeader}
        storeName={storeName}
        storeLogo={storeLogo}
      />

      {/* --- Content Area --- */}
      <div className="container mx-auto px-4 py-6 pb-28">
        {' '}
        {/* Padding bottom for cart button */}
        {/* --- Controls --- */}
        <MenuControls
          categories={categoriesData}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          onCategorySelect={handleCategorySelect}
          isSearchFocused={isSearchFocused}
          onSearchFocus={() => setIsSearchFocused(true)}
          onSearchBlur={() => setIsSearchFocused(false)}
          showStickyHeader={showStickyHeader}
        />
        {/* --- Menu Items --- */}
        {filteredCategories.length > 0 ? (
          <div className="space-y-8">
            {filteredCategories.map((category) => (
              <MenuCategorySection
                key={category.id}
                category={category}
                currency={storeCurrency}
                onCustomize={handleCustomize}
              />
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground py-10 text-center">
            {searchTerm
              ? `No menu items match your search "${searchTerm}".`
              : 'No menu items available.'}
          </div>
        )}
      </div>

      {/* --- Fixed Cart Button --- */}
      <AnimatePresence>
        {cartItemCount > 0 && (
          <motion.div
            className="bg-background fixed right-0 bottom-0 left-0 z-40 border-t p-4"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: 'spring', stiffness: 260, damping: 25 }}
          >
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  className="h-12 w-full justify-between text-lg"
                  aria-label={`View Basket, ${cartItemCount} items, total ${formatCurrency(cartTotal, storeCurrency)}`}
                  // disabled state might depend on mutation status if using React Query
                >
                  <div className="flex items-center gap-2">
                    <ShoppingBasket className="h-5 w-5" />
                    <span>
                      {cartItemCount} {cartItemCount === 1 ? 'Item' : 'Items'}
                    </span>
                  </div>
                  <span>
                    View Basket ({formatCurrency(cartTotal, storeCurrency)})
                  </span>
                </Button>
              </SheetTrigger>
              {/* Pass necessary props to CartSheetContent */}
              <CartSheetContent
                currency={storeCurrency}
                // Pass handlers directly
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                onRemoveItem={handleRemoveItem}
                onClearCart={handleClearCart}
                // isLoading prop removed
              />
            </Sheet>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Customization Dialog --- */}
      <CustomizationDialog
        item={customizationItem}
        currency={storeCurrency}
        isOpen={!!customizationItem}
        onClose={() => setCustomizationItem(null)}
      />
    </div>
  );
}
