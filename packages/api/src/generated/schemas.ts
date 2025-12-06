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
export type AdminSessionResponseDto = Schemas['AdminSessionResponseDto'];
export type CreateManualSessionDto = Schemas['CreateManualSessionDto'];
export type JoinSessionDto = Schemas['JoinSessionDto'];
export type SessionCreatedResponseDto = Schemas['SessionCreatedResponseDto'];
export type SessionResponseDto = Schemas['SessionResponseDto'];
export type StartTableSessionResponseDto =
  Schemas['StartTableSessionResponseDto'];
export type UpdateSessionDto = Schemas['UpdateSessionDto'];

// Order DTOs
export type AdminOrderAnalyticsDto = Schemas['AdminOrderAnalyticsDto'];
export type AdminOrderItemResponseDto = Schemas['AdminOrderItemResponseDto'];
export type AdminOrderResponseDto = Schemas['AdminOrderResponseDto'];
export type AdminOrderStoreInfoDto = Schemas['AdminOrderStoreInfoDto'];
export type KitchenOrderResponseDto = Schemas['KitchenOrderResponseDto'];
export type OrderBaseResponseDto = Schemas['OrderBaseResponseDto'];
export type OrderItemCustomizationResponseDto =
  Schemas['OrderItemCustomizationResponseDto'];
export type OrderItemResponseDto = Schemas['OrderItemResponseDto'];
export type OrderResponseDto = Schemas['OrderResponseDto'];
export type OrderStatusCountDto = Schemas['OrderStatusCountDto'];
export type OrderStatusReportDto = Schemas['OrderStatusReportDto'];
export type UpdateOrderStatusDto = Schemas['UpdateOrderStatusDto'];

// Standard API Response DTOs
export type AuditLogPaginatedResponseDto =
  Schemas['AuditLogPaginatedResponseDto'];
export type PaginatedResponseDto = Schemas['PaginatedResponseDto'];
export type PaginationMeta = Schemas['PaginationMeta'];
export type StandardApiErrorDetails = Schemas['StandardApiErrorDetails'];
export type StandardApiResponse = Schemas['StandardApiResponse'];

// User DTOs
export type ActivityUserInfoDto = Schemas['ActivityUserInfoDto'];
export type AdminSuspendUserDto = Schemas['AdminSuspendUserDto'];
export type AdminUserResponseDto = Schemas['AdminUserResponseDto'];
export type AuditLogUserDto = Schemas['AuditLogUserDto'];
export type BanUserDto = Schemas['BanUserDto'];
export type BankTransferDetailsDto = Schemas['BankTransferDetailsDto'];
export type CreateUserDto = Schemas['CreateUserDto'];
export type InviteOrAssignRoleDto = Schemas['InviteOrAssignRoleDto'];
export type InviteStaffDto = Schemas['InviteStaffDto'];
export type ReactivateUserDto = Schemas['ReactivateUserDto'];
export type SuspendUserDto = Schemas['SuspendUserDto'];
export type UserActionResponseDto = Schemas['UserActionResponseDto'];
export type UserActivityResponseDto = Schemas['UserActivityResponseDto'];
export type UserAdminInfoDto = Schemas['UserAdminInfoDto'];
export type UserCountsDto = Schemas['UserCountsDto'];
export type UserDetailResponseDto = Schemas['UserDetailResponseDto'];
export type UserProfileResponseDto = Schemas['UserProfileResponseDto'];
export type UserResponseDto = Schemas['UserResponseDto'];
export type UserSuspensionHistoryItemDto =
  Schemas['UserSuspensionHistoryItemDto'];

// Cart DTOs
export type AddToCartDto = Schemas['AddToCartDto'];
export type CartItemBaseResponseDto = Schemas['CartItemBaseResponseDto'];
export type CartItemCustomizationDto = Schemas['CartItemCustomizationDto'];
export type CartItemCustomizationResponseDto =
  Schemas['CartItemCustomizationResponseDto'];
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
export type AdminStoreCountsDto = Schemas['AdminStoreCountsDto'];
export type AdminStoreInformationDto = Schemas['AdminStoreInformationDto'];
export type AdminStoreSettingDto = Schemas['AdminStoreSettingDto'];
export type AdminStoreSubscriptionDto = Schemas['AdminStoreSubscriptionDto'];
export type AdminStoreTierDto = Schemas['AdminStoreTierDto'];
export type ChooseStoreDto = Schemas['ChooseStoreDto'];
export type CreateStoreDto = Schemas['CreateStoreDto'];
export type GetStoreDetailsResponseDto = Schemas['GetStoreDetailsResponseDto'];
export type PaymentStoreInfoDto = Schemas['PaymentStoreInfoDto'];
export type StoreActionResponseDto = Schemas['StoreActionResponseDto'];
export type StoreAnalyticsResponseDto = Schemas['StoreAnalyticsResponseDto'];
export type StoreDetailResponseDto = Schemas['StoreDetailResponseDto'];
export type StoreInformationResponseDto =
  Schemas['StoreInformationResponseDto'];
export type StoreResponseDto = Schemas['StoreResponseDto'];
export type StoreSettingResponseDto = Schemas['StoreSettingResponseDto'];
export type StoreUsageDto = Schemas['StoreUsageDto'];
export type UpdateStoreInformationDto = Schemas['UpdateStoreInformationDto'];
export type UpdateStoreSettingDto = Schemas['UpdateStoreSettingDto'];

// Category DTOs
export type CategoryBaseResponseDto = Schemas['CategoryBaseResponseDto'];
export type CategoryBasicResponseDto = Schemas['CategoryBasicResponseDto'];
export type CategoryDeletedResponseDto = Schemas['CategoryDeletedResponseDto'];
export type CategoryResponseDto = Schemas['CategoryResponseDto'];
export type CreateCategoryDto = Schemas['CreateCategoryDto'];
export type SortCategoryDto = Schemas['SortCategoryDto'];
export type UpdateCategoryDto = Schemas['UpdateCategoryDto'];
export type UpdateCategoryTranslationsDto =
  Schemas['UpdateCategoryTranslationsDto'];
export type UpsertCategoryDto = Schemas['UpsertCategoryDto'];

// Menu Item DTOs
export type CreateMenuItemDto = Schemas['CreateMenuItemDto'];
export type MenuCategoryDto = Schemas['MenuCategoryDto'];
export type MenuCustomizationGroupDto = Schemas['MenuCustomizationGroupDto'];
export type MenuCustomizationOptionDto = Schemas['MenuCustomizationOptionDto'];
export type MenuItemBaseResponseDto = Schemas['MenuItemBaseResponseDto'];
export type MenuItemDeletedResponseDto = Schemas['MenuItemDeletedResponseDto'];
export type MenuItemNestedResponseDto = Schemas['MenuItemNestedResponseDto'];
export type MenuItemResponseDto = Schemas['MenuItemResponseDto'];
export type PatchMenuItemDto = Schemas['PatchMenuItemDto'];
export type SortMenuItemDto = Schemas['SortMenuItemDto'];
export type UpdateMenuItemDto = Schemas['UpdateMenuItemDto'];
export type UpdateMenuItemTranslationsDto =
  Schemas['UpdateMenuItemTranslationsDto'];

// Customization DTOs
export type CustomizationGroupResponseDto =
  Schemas['CustomizationGroupResponseDto'];
export type CustomizationOptionResponseDto =
  Schemas['CustomizationOptionResponseDto'];
export type UpdateCustomizationGroupTranslationsDto =
  Schemas['UpdateCustomizationGroupTranslationsDto'];
export type UpdateCustomizationOptionTranslationsDto =
  Schemas['UpdateCustomizationOptionTranslationsDto'];
export type UpsertCustomizationGroupDto =
  Schemas['UpsertCustomizationGroupDto'];
export type UpsertCustomizationOptionDto =
  Schemas['UpsertCustomizationOptionDto'];

// Table DTOs
export type BatchUpsertTableDto = Schemas['BatchUpsertTableDto'];
export type CreateTableDto = Schemas['CreateTableDto'];
export type TableDeletedResponseDto = Schemas['TableDeletedResponseDto'];
export type TableResponseDto = Schemas['TableResponseDto'];
export type TableStatus = Schemas['TableStatus'];
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
export type UsageBreakdownDto = Schemas['UsageBreakdownDto'];

// Admin DTOs
export type AddUserToStoreDto = Schemas['AddUserToStoreDto'];
export type AdminInfoDto = Schemas['AdminInfoDto'];
export type AdminPaymentListItemDto = Schemas['AdminPaymentListItemDto'];
export type AdminPermissionsResponseDto =
  Schemas['AdminPermissionsResponseDto'];
export type AdminProfileResponseDto = Schemas['AdminProfileResponseDto'];
export type AdminRejectPaymentDto = Schemas['AdminRejectPaymentDto'];
export type AdminStoreUserDto = Schemas['AdminStoreUserDto'];
export type AdminStoreUserStoreDto = Schemas['AdminStoreUserStoreDto'];
export type AdminVerifyPaymentDto = Schemas['AdminVerifyPaymentDto'];
export type BanStoreDto = Schemas['BanStoreDto'];
export type ReactivateStoreDto = Schemas['ReactivateStoreDto'];
export type SuspendStoreDto = Schemas['SuspendStoreDto'];
export type UserStoreAssociationDto = Schemas['UserStoreAssociationDto'];
export type UserStoreDetailsDto = Schemas['UserStoreDetailsDto'];
export type UserStoreInfoDto = Schemas['UserStoreInfoDto'];
export type ValidateAdminResponseDto = Schemas['ValidateAdminResponseDto'];
export type ValidateAdminTokenDto = Schemas['ValidateAdminTokenDto'];

// Payment DTOs
export type ByItemSplitDataDto = Schemas['ByItemSplitDataDto'];
export type CalculateSplitDto = Schemas['CalculateSplitDto'];
export type CreatePaymentRequestDto = Schemas['CreatePaymentRequestDto'];
export type CreateRefundDto = Schemas['CreateRefundDto'];
export type CreateRefundRequestDto = Schemas['CreateRefundRequestDto'];
export type CustomSplitDataDto = Schemas['CustomSplitDataDto'];
export type EvenSplitDataDto = Schemas['EvenSplitDataDto'];
export type PaymentActionResponseDto = Schemas['PaymentActionResponseDto'];
export type PaymentDetailResponseDto = Schemas['PaymentDetailResponseDto'];
export type PaymentRequestResponseDto = Schemas['PaymentRequestResponseDto'];
export type PaymentResponseDto = Schemas['PaymentResponseDto'];
export type RecordPaymentDto = Schemas['RecordPaymentDto'];
export type RecordSplitPaymentDto = Schemas['RecordSplitPaymentDto'];
export type RefundRequestResponseDto = Schemas['RefundRequestResponseDto'];
export type RefundResponseDto = Schemas['RefundResponseDto'];
export type RejectPaymentDto = Schemas['RejectPaymentDto'];
export type SplitMetadataDto = Schemas['SplitMetadataDto'];
export type VerifyPaymentDto = Schemas['VerifyPaymentDto'];

// Translation DTOs
export type BaseTranslationDto = Schemas['BaseTranslationDto'];
export type BaseTranslationResponseDto = Schemas['BaseTranslationResponseDto'];
export type TranslationWithDescriptionDto =
  Schemas['TranslationWithDescriptionDto'];
export type TranslationWithDescriptionResponseDto =
  Schemas['TranslationWithDescriptionResponseDto'];

// Sort DTOs
export type SortCategoriesPayloadDto = Schemas['SortCategoriesPayloadDto'];

// Ownership Transfer DTOs
export type InitiateOwnershipTransferDto =
  Schemas['InitiateOwnershipTransferDto'];
export type OwnershipTransferResponseDto =
  Schemas['OwnershipTransferResponseDto'];
export type VerifyOtpDto = Schemas['VerifyOtpDto'];

// Business Hours DTOs
export type BusinessHoursDto = Schemas['BusinessHoursDto'];
export type DayHoursDto = Schemas['DayHoursDto'];

// Tax and Service Charge DTOs
export type UpdateLoyaltyRulesDto = Schemas['UpdateLoyaltyRulesDto'];
export type UpdateTaxAndServiceChargeDto =
  Schemas['UpdateTaxAndServiceChargeDto'];

// SOS (Customer) DTOs
export type SosCartItemCustomizationDto =
  Schemas['SosCartItemCustomizationDto'];
export type SosCartItemResponseDto = Schemas['SosCartItemResponseDto'];
export type SosCartResponseDto = Schemas['SosCartResponseDto'];
export type SosCategoryResponseDto = Schemas['SosCategoryResponseDto'];
export type SosCustomizationGroupDto = Schemas['SosCustomizationGroupDto'];
export type SosCustomizationOptionDto = Schemas['SosCustomizationOptionDto'];
export type SosMenuItemResponseDto = Schemas['SosMenuItemResponseDto'];
export type SosMenuItemSimpleDto = Schemas['SosMenuItemSimpleDto'];
export type SosOrderItemResponseDto = Schemas['SosOrderItemResponseDto'];
export type SosOrderResponseDto = Schemas['SosOrderResponseDto'];

// Other DTOs
export type ApplyDiscountDto = Schemas['ApplyDiscountDto'];
export type AuditLogDetailsDto = Schemas['AuditLogDetailsDto'];
export type AuditLogEntryDto = Schemas['AuditLogEntryDto'];
export type AutoPrintMode = Schemas['AutoPrintMode'];
export type ChangeRoleDto = Schemas['ChangeRoleDto'];
export type DowngradeTierDto = Schemas['DowngradeTierDto'];
export type FeatureAccessDto = Schemas['FeatureAccessDto'];
export type FontSize = Schemas['FontSize'];
export type GetPrintSettingResponseDto = Schemas['GetPrintSettingResponseDto'];
export type PaperSize = Schemas['PaperSize'];
export type ResourceUsageDto = Schemas['ResourceUsageDto'];
export type SpecialHoursEntryDto = Schemas['SpecialHoursEntryDto'];
export type SubscriptionResponseDto = Schemas['SubscriptionResponseDto'];
export type SuspensionHistoryItemDto = Schemas['SuspensionHistoryItemDto'];
export type TierResponseDto = Schemas['TierResponseDto'];
export type TrialEligibilityResponseDto =
  Schemas['TrialEligibilityResponseDto'];
export type TrialInfoResponseDto = Schemas['TrialInfoResponseDto'];
export type UpdatePrintSettingResponseDto =
  Schemas['UpdatePrintSettingResponseDto'];
export type UpdatePrintSettingsDto = Schemas['UpdatePrintSettingsDto'];
export type VersionMetadataDto = Schemas['VersionMetadataDto'];
