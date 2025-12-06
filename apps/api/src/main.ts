import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

import { SessionCreatedResponseDto } from 'src/active-table-session/dto/session-created-response.dto';
import { SessionResponseDto } from 'src/active-table-session/dto/session-response.dto';
import {
  AdminOrderAnalyticsDto,
  AdminOrderItemResponseDto,
  AdminOrderResponseDto,
  AdminOrderStoreInfoDto,
} from 'src/admin/dto/admin-order-response.dto';
import {
  AdminPaymentListItemDto,
  PaymentActionResponseDto as AdminPaymentActionResponseDto,
  PaymentDetailResponseDto as AdminPaymentDetailResponseDto,
  PaymentStoreInfoDto,
} from 'src/admin/dto/admin-payment-response.dto';
import { AdminPermissionsResponseDto } from 'src/admin/dto/admin-permissions-response.dto';
import { AdminProfileResponseDto } from 'src/admin/dto/admin-profile-response.dto';
import { AdminSessionResponseDto } from 'src/admin/dto/admin-session-response.dto';
import {
  AdminInfoDto,
  AdminStoreCountsDto,
  AdminStoreInformationDto,
  AdminStoreSubscriptionDto,
  AdminStoreTierDto,
  StoreActionResponseDto,
  StoreAnalyticsResponseDto,
  StoreDetailResponseDto,
  StoreResponseDto as AdminStoreResponseDto,
  SuspensionHistoryItemDto,
} from 'src/admin/dto/admin-store-response.dto';
import {
  ActivityUserInfoDto,
  UserActionResponseDto,
  UserActivityResponseDto,
  UserAdminInfoDto,
  UserCountsDto,
  UserDetailResponseDto,
  UserResponseDto as AdminUserListResponseDto,
  UserStoreAssociationDto,
  UserStoreDetailsDto,
  UserStoreInfoDto,
  UserSuspensionHistoryItemDto,
} from 'src/admin/dto/admin-user-response.dto';
import {
  AdminUserResponseDto,
  ValidateAdminResponseDto,
} from 'src/admin/dto/validate-admin-response.dto';
import { AuditLogDetailsDto } from 'src/audit-log/dto/audit-log-details.dto';
import {
  CartItemCustomizationResponseDto,
  CartItemResponseDto,
  CartResponseDto,
} from 'src/cart/dto/cart-response.dto';
import {
  CartItemBaseResponseDto,
  CategoryBaseResponseDto,
  MenuItemBaseResponseDto,
  OrderBaseResponseDto,
} from 'src/common/dto/base';
import {
  PaginatedResponseDto,
  PaginationMeta,
} from 'src/common/dto/paginated-response.dto';
import { StandardApiErrorDetails } from 'src/common/dto/standard-api-error-details.dto';
import { StandardApiResponse } from 'src/common/dto/standard-api-response.dto';
import {
  ImageMetadataDto,
  VersionMetadataDto,
} from 'src/common/upload/dto/upload-image-response.dto';
import { KitchenOrderResponseDto } from 'src/kitchen/dto/kitchen-order-response.dto';
import {
  OrderItemCustomizationResponseDto,
  OrderItemResponseDto,
  OrderResponseDto,
} from 'src/order/dto/order-response.dto';
import {
  PaymentResponseDto,
  RefundResponseDto,
} from 'src/payment/dto/payment-response.dto';
import {
  ByItemSplitDataDto,
  CustomSplitDataDto,
  EvenSplitDataDto,
  SplitMetadataDto,
} from 'src/payment/dto/split-types.dto';
import {
  OrderStatusCountDto,
  OrderStatusReportDto,
} from 'src/report/dto/order-status-report.dto';
import {
  PaymentBreakdownDto,
  PaymentMethodBreakdownDto,
} from 'src/report/dto/payment-breakdown.dto';
import {
  PopularItemDto,
  PopularItemsDto,
} from 'src/report/dto/popular-items.dto';
import { SalesSummaryDto } from 'src/report/dto/sales-summary.dto';
import {
  SosCartItemCustomizationDto,
  SosCartItemResponseDto,
  SosCartResponseDto,
  SosCategoryResponseDto,
  SosCustomizationGroupDto,
  SosCustomizationOptionDto,
  SosMenuItemResponseDto,
  SosMenuItemSimpleDto,
  SosOrderItemResponseDto,
  SosOrderResponseDto,
} from 'src/sos/dto';
import {
  BusinessHoursDto,
  DayHoursDto,
  SpecialHoursEntryDto,
} from 'src/store/dto/business-hours.dto';
import { GetStoreDetailsResponseDto } from 'src/store/dto/get-store-details-response.dto';
import {
  GetPrintSettingResponseDto,
  UpdatePrintSettingResponseDto,
} from 'src/store/dto/print-settings.dto';
import { StoreInformationResponseDto } from 'src/store/dto/store-information-response.dto';
import { StoreSettingResponseDto } from 'src/store/dto/store-setting-response.dto';
import { BankTransferDetailsDto } from 'src/subscription/dto/bank-transfer-details.dto';
import {
  OwnershipTransferResponseDto,
  PaymentRequestResponseDto,
  RefundRequestResponseDto,
  SubscriptionResponseDto,
  TrialEligibilityResponseDto,
  TrialInfoResponseDto,
} from 'src/subscription/dto/subscription-response.dto';

import { AppModule } from './app.module';

/**
 * Extra models for Swagger document generation.
 * All DTOs used with getSchemaPath() must be registered here.
 */
const extraModels = [
  // Common
  StandardApiResponse,
  StandardApiErrorDetails,
  PaginatedResponseDto,
  PaginationMeta,
  // Session
  SessionCreatedResponseDto,
  SessionResponseDto,
  // Cart
  CartResponseDto,
  CartItemResponseDto,
  CartItemCustomizationResponseDto,
  // Order
  OrderResponseDto,
  OrderItemResponseDto,
  OrderItemCustomizationResponseDto,
  KitchenOrderResponseDto,
  // Payment (Order Payments)
  PaymentResponseDto,
  RefundResponseDto,
  // Admin Auth
  ValidateAdminResponseDto,
  AdminUserResponseDto,
  AdminProfileResponseDto,
  AdminPermissionsResponseDto,
  // Admin Store Management
  AdminStoreResponseDto,
  StoreDetailResponseDto,
  StoreActionResponseDto,
  StoreAnalyticsResponseDto,
  AdminStoreInformationDto,
  AdminStoreSubscriptionDto,
  AdminStoreTierDto,
  AdminStoreCountsDto,
  AdminInfoDto,
  SuspensionHistoryItemDto,
  // Admin User Management
  AdminUserListResponseDto,
  UserDetailResponseDto,
  UserActionResponseDto,
  UserActivityResponseDto,
  UserStoreInfoDto,
  UserStoreDetailsDto,
  UserStoreAssociationDto,
  UserCountsDto,
  UserAdminInfoDto,
  UserSuspensionHistoryItemDto,
  ActivityUserInfoDto,
  // Admin Payment Management
  AdminPaymentListItemDto,
  AdminPaymentDetailResponseDto,
  AdminPaymentActionResponseDto,
  PaymentStoreInfoDto,
  // Admin Order Management
  AdminOrderResponseDto,
  AdminOrderItemResponseDto,
  AdminOrderAnalyticsDto,
  AdminOrderStoreInfoDto,
  // Admin Session Management
  AdminSessionResponseDto,
  // Reports
  SalesSummaryDto,
  PaymentBreakdownDto,
  PaymentMethodBreakdownDto,
  PopularItemsDto,
  PopularItemDto,
  OrderStatusReportDto,
  OrderStatusCountDto,
  // Store
  GetStoreDetailsResponseDto,
  StoreInformationResponseDto,
  StoreSettingResponseDto,
  GetPrintSettingResponseDto,
  UpdatePrintSettingResponseDto,
  // Store - Business Hours (typed value DTOs)
  BusinessHoursDto,
  DayHoursDto,
  SpecialHoursEntryDto,
  // Subscription
  SubscriptionResponseDto,
  TrialEligibilityResponseDto,
  TrialInfoResponseDto,
  PaymentRequestResponseDto,
  RefundRequestResponseDto,
  OwnershipTransferResponseDto,
  // Subscription - Bank Transfer (typed value DTO)
  BankTransferDetailsDto,
  // Payment - Split Types (typed value DTOs)
  SplitMetadataDto,
  EvenSplitDataDto,
  ByItemSplitDataDto,
  CustomSplitDataDto,
  // Audit Log - Details (typed value DTO)
  AuditLogDetailsDto,
  // Upload - Image Metadata (typed value DTOs)
  VersionMetadataDto,
  ImageMetadataDto,
  // Base DTOs
  OrderBaseResponseDto,
  CategoryBaseResponseDto,
  MenuItemBaseResponseDto,
  CartItemBaseResponseDto,
  // SOS DTOs (Self-Ordering System)
  SosOrderResponseDto,
  SosOrderItemResponseDto,
  SosCategoryResponseDto,
  SosMenuItemSimpleDto,
  SosMenuItemResponseDto,
  SosCustomizationGroupDto,
  SosCustomizationOptionDto,
  SosCartResponseDto,
  SosCartItemResponseDto,
  SosCartItemCustomizationDto,
];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get ConfigService from application context
  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>('NODE_ENV', 'production');
  const corsOrigin = configService.get<string>(
    'CORS_ORIGIN',
    'https://origin-food-house.com'
  );

  // Set global API prefix for all routes
  app.setGlobalPrefix('api/v1');

  // Configure CORS
  const corsConfig = {
    origin: nodeEnv === 'dev' ? true : corsOrigin.split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-session-token',
      'X-App-Context',
    ],
    exposedHeaders: ['X-App-Context', 'Deprecation', 'Sunset', 'Link'],
  };

  app.enableCors(corsConfig);

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('Origin Food House API')
    .setDescription(
      'API documentation for the Restaurant Management & Ordering system'
    )
    .setVersion('1.0')
    .addBearerAuth()
    .setOpenAPIVersion('3.1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config, { extraModels });
  SwaggerModule.setup('api-docs', app, document, {
    jsonDocumentUrl: '/api-docs-json',
  });

  await app.listen(3000);
}

void bootstrap();
