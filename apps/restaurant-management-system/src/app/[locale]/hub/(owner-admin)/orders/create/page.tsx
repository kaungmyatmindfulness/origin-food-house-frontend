'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ShoppingCart, Trash2, Plus, Percent, Split } from 'lucide-react';

import {
  selectSelectedStoreId,
  useAuthStore,
} from '@/features/auth/store/auth.store';
import { getCategories } from '@/features/menu/services/category.service';
import { getStoreMenuItems } from '@/features/menu/services/menu-item.service';
import {
  createManualSession,
  type SessionType,
  type CreateManualSessionDto,
} from '@/features/orders/services/session.service';
import {
  addToCart,
  getCart,
  removeFromCart,
  checkoutCart,
} from '@/features/orders/services/order.service';
import type { AddToCartDto } from '@repo/api/generated/types';
import { menuKeys } from '@/features/menu/queries/menu.keys';
import { Button } from '@repo/ui/components/button';
import { Card } from '@repo/ui/components/card';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { RadioGroup, RadioGroupItem } from '@repo/ui/components/radio-group';
import { toast } from '@repo/ui/lib/toast';
import { formatCurrency } from '@/utils/formatting';
import type { MenuItem } from '@/features/menu/types/menu-item.types';
import { DiscountDialog } from '@/features/discounts/components/DiscountDialog';
import { BillSplittingDialog } from '@/features/payments/components/BillSplittingDialog';

export default function CreateOrderPage() {
  const t = useTranslations('orders');
  const tCommon = useTranslations('common');
  const tDiscount = useTranslations('payments.discounts');
  const tBillSplit = useTranslations('payments.billSplitting');
  const router = useRouter();

  const selectedStoreId = useAuthStore(selectSelectedStoreId);

  // Form state
  const [sessionType, setSessionType] = useState<SessionType>('COUNTER');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  // Dialog state for discount and bill splitting
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
  const [billSplitDialogOpen, setBillSplitDialogOpen] = useState(false);

  // Fetch menu data
  const { data: categories = [] } = useQuery({
    queryKey: menuKeys.categories(selectedStoreId!),
    queryFn: () => getCategories(selectedStoreId!),
    enabled: !!selectedStoreId,
  });

  const { data: menuItems = [] } = useQuery({
    queryKey: menuKeys.items(selectedStoreId!),
    queryFn: () => getStoreMenuItems(selectedStoreId!),
    enabled: !!selectedStoreId,
  });

  // Fetch cart
  const { data: cart, refetch: refetchCart } = useQuery({
    queryKey: ['cart', sessionId],
    queryFn: () => getCart(sessionId!),
    enabled: !!sessionId,
  });

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async () => {
      if (!selectedStoreId) throw new Error('No store selected');

      const sessionData: CreateManualSessionDto = {
        sessionType,
        ...(customerName && { customerName }),
        ...(customerPhone && { customerPhone }),
        guestCount: 1,
      };

      return createManualSession(selectedStoreId, sessionData);
    },
    onSuccess: (session) => {
      setSessionId(session.id);
      toast.success(t('sessionCreated'), {
        description: t('sessionCreatedDesc'),
      });
    },
    onError: (error: Error) => {
      toast.error(tCommon('error'), {
        description: error.message,
      });
    },
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (data: AddToCartDto) => {
      if (!sessionId) throw new Error('No active session');
      return addToCart(sessionId, data);
    },
    onSuccess: () => {
      refetchCart();
      toast.success(t('itemAdded'), {
        description: t('itemAddedDesc'),
      });
    },
    onError: (error: Error) => {
      toast.error(tCommon('error'), {
        description: error.message,
      });
    },
  });

  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: async (cartItemId: string) => {
      if (!sessionId) throw new Error('No active session');
      return removeFromCart(sessionId, cartItemId);
    },
    onSuccess: () => {
      refetchCart();
      toast.success(t('itemRemoved'), {
        description: t('itemRemovedDesc'),
      });
    },
  });

  // Checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      if (!sessionId) throw new Error('No active session');
      return checkoutCart(sessionId);
    },
    onSuccess: (order) => {
      setPlacedOrderId(order.id);
      toast.success(t('orderCreated'), {
        description: t('orderCreatedDesc', { orderId: order.id }),
      });
      // Order created - can now apply discounts or split bill
    },
    onError: (error: Error) => {
      toast.error(tCommon('error'), {
        description: error.message,
      });
    },
  });

  // Handlers
  const handleAddItem = useCallback(
    (item: MenuItem) => {
      if (!sessionId) {
        // If no session, create one first
        createSessionMutation.mutate();
        // Will add item after session is created
        return;
      }

      addToCartMutation.mutate({
        menuItemId: item.id,
        quantity: 1,
        customizations: [],
      });
    },
    [sessionId, createSessionMutation, addToCartMutation]
  );

  const handleRemoveItem = useCallback(
    (cartItemId: string) => {
      removeFromCartMutation.mutate(cartItemId);
    },
    [removeFromCartMutation]
  );

  const handleCheckout = useCallback(() => {
    checkoutMutation.mutate();
  }, [checkoutMutation]);

  // Calculate totals
  const cartItems = cart?.items || [];
  const subtotal = cart?.subTotal || '0';
  // Note: Cart response doesn't include calculated tax/service charge fields
  // These would need to be calculated client-side or fetched from order endpoint

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('createOrder')}</h1>
        <Button variant="outline" onClick={() => router.back()}>
          {tCommon('cancel')}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Session & Menu */}
        <div className="space-y-6 lg:col-span-2">
          {/* Session Type & Customer Info */}
          {!sessionId && (
            <Card className="p-6">
              <h2 className="mb-4 text-xl font-semibold">{t('sessionInfo')}</h2>

              <div className="space-y-4">
                {/* Session Type */}
                <div>
                  <Label>{t('sessionType')}</Label>
                  <RadioGroup
                    value={sessionType}
                    onValueChange={(value) =>
                      setSessionType(value as SessionType)
                    }
                    className="mt-2 flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="COUNTER" id="counter" />
                      <Label htmlFor="counter">{t('counterOrder')}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="PHONE" id="phone" />
                      <Label htmlFor="phone">{t('phoneOrder')}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="TAKEOUT" id="takeout" />
                      <Label htmlFor="takeout">{t('takeoutOrder')}</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerName">{t('customerName')}</Label>
                    <Input
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={t('customerNamePlaceholder')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerPhone">{t('customerPhone')}</Label>
                    <Input
                      id="customerPhone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder={t('customerPhonePlaceholder')}
                    />
                  </div>
                </div>

                <Button
                  onClick={() => createSessionMutation.mutate()}
                  disabled={createSessionMutation.isPending}
                  className="w-full"
                >
                  {createSessionMutation.isPending
                    ? t('creating')
                    : t('startSession')}
                </Button>
              </div>
            </Card>
          )}

          {/* Menu Items */}
          {sessionId && (
            <Card className="p-6">
              <h2 className="mb-4 text-xl font-semibold">{t('selectItems')}</h2>

              {categories.map((category) => {
                const categoryItems = menuItems.filter(
                  (item) => item.category?.id === category.id
                );

                if (categoryItems.length === 0) return null;

                return (
                  <div key={category.id} className="mb-6">
                    <h3 className="mb-3 text-lg font-semibold">
                      {category.name}
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {categoryItems.map((item) => (
                        <Card
                          key={item.id}
                          className="cursor-pointer p-4 transition-shadow hover:shadow-md"
                          onClick={() =>
                            handleAddItem(item as unknown as MenuItem)
                          }
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{item.name}</h4>
                              {item.description && (
                                <p className="text-muted-foreground mt-1 text-sm">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">
                                {formatCurrency(item.basePrice)}
                              </p>
                              <Button size="sm" className="mt-2">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </Card>
          )}
        </div>

        {/* Right: Cart */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <ShoppingCart className="h-5 w-5" />
                {t('cart')}
              </h2>
              <span className="text-muted-foreground text-sm">
                {cartItems.length} {t('items')}
              </span>
            </div>

            {cartItems.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">
                {t('emptyCart')}
              </p>
            ) : (
              <>
                <div className="mb-4 max-h-96 space-y-3 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-muted flex items-start justify-between rounded-lg p-3"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.menuItemName}</p>
                        <p className="text-muted-foreground text-sm">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-right">
                        <p className="font-semibold">
                          {formatCurrency(item.basePrice)}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between border-t pt-2 text-lg font-bold">
                    <span>{t('subtotal')}</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                </div>

                {!placedOrderId ? (
                  <Button
                    className="mt-4 w-full"
                    size="lg"
                    onClick={handleCheckout}
                    disabled={checkoutMutation.isPending}
                  >
                    {checkoutMutation.isPending
                      ? t('processing')
                      : t('placeOrder')}
                  </Button>
                ) : (
                  <>
                    {/* Payment actions after order placed */}
                    <div className="mt-4 space-y-2">
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => setDiscountDialogOpen(true)}
                      >
                        <Percent className="mr-2 h-4 w-4" />
                        {tDiscount('applyDiscount')}
                      </Button>
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => setBillSplitDialogOpen(true)}
                      >
                        <Split className="mr-2 h-4 w-4" />
                        {tBillSplit('title')}
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}
          </Card>
        </div>
      </div>

      {/* Discount Dialog - Mock order object since backend not running */}
      {placedOrderId && cart && (
        <>
          <DiscountDialog
            open={discountDialogOpen}
            onOpenChange={setDiscountDialogOpen}
            orderId={placedOrderId}
            order={{
              id: placedOrderId,
              orderNumber: '1',
              storeId: selectedStoreId || '',
              sessionId: { id: sessionId || '' },
              tableName: 'Manual Order',
              status: 'PENDING',
              orderType: sessionType === 'COUNTER' ? 'DINE_IN' : 'TAKEAWAY',
              paidAt: {},
              subTotal: cart.subTotal || '0',
              vatRateSnapshot: '0',
              serviceChargeRateSnapshot: '0',
              vatAmount: '0',
              serviceChargeAmount: '0',
              grandTotal: cart.subTotal || '0',
              totalPaid: '0',
              remainingBalance: cart.subTotal || '0',
              isPaidInFull: false,
              orderItems: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }}
          />
          <BillSplittingDialog
            open={billSplitDialogOpen}
            onOpenChange={setBillSplitDialogOpen}
            orderId={placedOrderId}
            order={{
              id: placedOrderId,
              orderNumber: '1',
              storeId: selectedStoreId || '',
              sessionId: { id: sessionId || '' },
              tableName: 'Manual Order',
              status: 'PENDING',
              orderType: sessionType === 'COUNTER' ? 'DINE_IN' : 'TAKEAWAY',
              paidAt: {},
              subTotal: cart.subTotal || '0',
              vatRateSnapshot: '0',
              serviceChargeRateSnapshot: '0',
              vatAmount: '0',
              serviceChargeAmount: '0',
              grandTotal: cart.subTotal || '0',
              totalPaid: '0',
              remainingBalance: cart.subTotal || '0',
              isPaidInFull: false,
              orderItems: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }}
          />
        </>
      )}
    </div>
  );
}
