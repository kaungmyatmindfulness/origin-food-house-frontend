/**
 * Auto-generated schema type exports from OpenAPI spec.
 * DO NOT EDIT MANUALLY - Run `npm run generate:api` to regenerate.
 *
 * Usage: import type { CartResponseDto } from '@repo/api/generated/schemas';
 */

import type { components } from './api';

// Helper type for accessing schemas
type Schemas = components['schemas'];

// Session DTOs
export type CreateManualSessionDto = Schemas['CreateManualSessionDto'];
export type JoinSessionDto = Schemas['JoinSessionDto'];
export type SessionCreatedResponseDto = Schemas['SessionCreatedResponseDto'];
export type SessionResponseDto = Schemas['SessionResponseDto'];
export type UpdateSessionDto = Schemas['UpdateSessionDto'];

// Order DTOs
export type KitchenOrderResponseDto = Schemas['KitchenOrderResponseDto'];
export type OrderItemCustomizationResponseDto = Schemas['OrderItemCustomizationResponseDto'];
export type OrderItemResponseDto = Schemas['OrderItemResponseDto'];
export type OrderResponseDto = Schemas['OrderResponseDto'];
export type OrderStatusCountDto = Schemas['OrderStatusCountDto'];
export type OrderStatusReportDto = Schemas['OrderStatusReportDto'];
export type UpdateOrderStatusDto = Schemas['UpdateOrderStatusDto'];

// Standard API Response DTOs
export type PaginatedResponseDto = Schemas['PaginatedResponseDto'];
export type PaginationMeta = Schemas['PaginationMeta'];
export type StandardApiErrorDetails = Schemas['StandardApiErrorDetails'];
export type StandardApiResponse = Schemas['StandardApiResponse'];

// User DTOs
export type AdminUserResponseDto = Schemas['AdminUserResponseDto'];
export type BanUserDto = Schemas['BanUserDto'];
export type CreateUserDto = Schemas['CreateUserDto'];
export type InviteOrAssignRoleDto = Schemas['InviteOrAssignRoleDto'];
export type InviteStaffDto = Schemas['InviteStaffDto'];
export type ReactivateUserDto = Schemas['ReactivateUserDto'];
export type SuspendUserDto = Schemas['SuspendUserDto'];
export type UserProfileResponseDto = Schemas['UserProfileResponseDto'];

// Cart DTOs
export type AddToCartDto = Schemas['AddToCartDto'];
export type CartItemCustomizationDto = Schemas['CartItemCustomizationDto'];
export type CartItemCustomizationResponseDto = Schemas['CartItemCustomizationResponseDto'];
export type CartItemResponseDto = Schemas['CartItemResponseDto'];
export type CartResponseDto = Schemas['CartResponseDto'];
export type CheckoutCartDto = Schemas['CheckoutCartDto'];
export type UpdateCartItemDto = Schemas['UpdateCartItemDto'];

// Quick Sale DTOs
export type QuickSaleCheckoutDto = Schemas['QuickSaleCheckoutDto'];
export type QuickSaleItemDto = Schemas['QuickSaleItemDto'];

// Kitchen DTOs
export type UpdateKitchenStatusDto = Schemas['UpdateKitchenStatusDto'];

// Store DTOs
export type ChooseStoreDto = Schemas['ChooseStoreDto'];
export type CreateStoreDto = Schemas['CreateStoreDto'];
export type GetStoreDetailsResponseDto = Schemas['GetStoreDetailsResponseDto'];
export type StoreInformationResponseDto = Schemas['StoreInformationResponseDto'];
export type StoreSettingResponseDto = Schemas['StoreSettingResponseDto'];
export type UpdateStoreInformationDto = Schemas['UpdateStoreInformationDto'];
export type UpdateStoreSettingDto = Schemas['UpdateStoreSettingDto'];

// Category DTOs
export type CategoryBasicResponseDto = Schemas['CategoryBasicResponseDto'];
export type CategoryDeletedResponseDto = Schemas['CategoryDeletedResponseDto'];
export type CategoryResponseDto = Schemas['CategoryResponseDto'];
export type CreateCategoryDto = Schemas['CreateCategoryDto'];
export type SortCategoryDto = Schemas['SortCategoryDto'];
export type UpdateCategoryDto = Schemas['UpdateCategoryDto'];
export type UpdateCategoryTranslationsDto = Schemas['UpdateCategoryTranslationsDto'];
export type UpsertCategoryDto = Schemas['UpsertCategoryDto'];

// Menu Item DTOs
export type CreateMenuItemDto = Schemas['CreateMenuItemDto'];
export type MenuItemDeletedResponseDto = Schemas['MenuItemDeletedResponseDto'];
export type MenuItemNestedResponseDto = Schemas['MenuItemNestedResponseDto'];
export type MenuItemResponseDto = Schemas['MenuItemResponseDto'];
export type PatchMenuItemDto = Schemas['PatchMenuItemDto'];
export type SortMenuItemDto = Schemas['SortMenuItemDto'];
export type UpdateMenuItemDto = Schemas['UpdateMenuItemDto'];
export type UpdateMenuItemTranslationsDto = Schemas['UpdateMenuItemTranslationsDto'];

// Customization DTOs
export type CustomizationGroupResponseDto = Schemas['CustomizationGroupResponseDto'];
export type CustomizationOptionResponseDto = Schemas['CustomizationOptionResponseDto'];
export type UpdateCustomizationGroupTranslationsDto = Schemas['UpdateCustomizationGroupTranslationsDto'];
export type UpdateCustomizationOptionTranslationsDto = Schemas['UpdateCustomizationOptionTranslationsDto'];
export type UpsertCustomizationGroupDto = Schemas['UpsertCustomizationGroupDto'];
export type UpsertCustomizationOptionDto = Schemas['UpsertCustomizationOptionDto'];

// Table DTOs
export type BatchUpsertTableDto = Schemas['BatchUpsertTableDto'];
export type CreateTableDto = Schemas['CreateTableDto'];
export type TableDeletedResponseDto = Schemas['TableDeletedResponseDto'];
export type TableResponseDto = Schemas['TableResponseDto'];
export type UpdateTableDto = Schemas['UpdateTableDto'];
export type UpdateTableStatusDto = Schemas['UpdateTableStatusDto'];
export type UpsertTableDto = Schemas['UpsertTableDto'];

// Upload DTOs
export type ImageMetadataDto = Schemas['ImageMetadataDto'];
export type UploadImageResponseDto = Schemas['UploadImageResponseDto'];

// Reports DTOs
export type PaymentBreakdownDto = Schemas['PaymentBreakdownDto'];
export type PaymentMethodBreakdownDto = Schemas['PaymentMethodBreakdownDto'];
export type PopularItemDto = Schemas['PopularItemDto'];
export type PopularItemsDto = Schemas['PopularItemsDto'];
export type SalesSummaryDto = Schemas['SalesSummaryDto'];

// Admin DTOs
export type AddUserToStoreDto = Schemas['AddUserToStoreDto'];
export type AdminPermissionsResponseDto = Schemas['AdminPermissionsResponseDto'];
export type AdminProfileResponseDto = Schemas['AdminProfileResponseDto'];
export type BanStoreDto = Schemas['BanStoreDto'];
export type ReactivateStoreDto = Schemas['ReactivateStoreDto'];
export type SuspendStoreDto = Schemas['SuspendStoreDto'];
export type ValidateAdminResponseDto = Schemas['ValidateAdminResponseDto'];
export type ValidateAdminTokenDto = Schemas['ValidateAdminTokenDto'];

// Payment DTOs
export type CalculateSplitDto = Schemas['CalculateSplitDto'];
export type CreatePaymentRequestDto = Schemas['CreatePaymentRequestDto'];
export type CreateRefundDto = Schemas['CreateRefundDto'];
export type CreateRefundRequestDto = Schemas['CreateRefundRequestDto'];
export type PaymentResponseDto = Schemas['PaymentResponseDto'];
export type RecordPaymentDto = Schemas['RecordPaymentDto'];
export type RecordSplitPaymentDto = Schemas['RecordSplitPaymentDto'];
export type RefundResponseDto = Schemas['RefundResponseDto'];
export type RejectPaymentDto = Schemas['RejectPaymentDto'];
export type VerifyPaymentDto = Schemas['VerifyPaymentDto'];

// Translation DTOs
export type BaseTranslationDto = Schemas['BaseTranslationDto'];
export type TranslationWithDescriptionDto = Schemas['TranslationWithDescriptionDto'];

// Sort DTOs
export type SortCategoriesPayloadDto = Schemas['SortCategoriesPayloadDto'];

// Ownership Transfer DTOs
export type InitiateOwnershipTransferDto = Schemas['InitiateOwnershipTransferDto'];
export type VerifyOtpDto = Schemas['VerifyOtpDto'];

// Business Hours DTOs
export type BusinessHoursDto = Schemas['BusinessHoursDto'];
export type DayHoursDto = Schemas['DayHoursDto'];

// Tax and Service Charge DTOs
export type UpdateLoyaltyRulesDto = Schemas['UpdateLoyaltyRulesDto'];
export type UpdateTaxAndServiceChargeDto = Schemas['UpdateTaxAndServiceChargeDto'];

// Other DTOs
export type ApplyDiscountDto = Schemas['ApplyDiscountDto'];
export type ChangeRoleDto = Schemas['ChangeRoleDto'];
export type DowngradeTierDto = Schemas['DowngradeTierDto'];
