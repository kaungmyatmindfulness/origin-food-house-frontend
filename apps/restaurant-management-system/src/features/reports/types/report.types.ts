/**
 * Report types based on backend DTOs
 */

export interface SalesSummaryDto {
  totalSales: string; // Decimal as string
  orderCount: number;
  averageOrderValue: string; // Decimal as string
  totalVat: string;
  totalServiceCharge: string;
  startDate: string;
  endDate: string;
}

export interface PopularItemDto {
  menuItemId: string;
  menuItemName: string;
  quantitySold: number;
  totalRevenue: string; // Decimal as string
  orderCount: number;
}

export interface PopularItemsDto {
  items: PopularItemDto[];
  startDate: string;
  endDate: string;
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  MOBILE_PAYMENT = 'MOBILE_PAYMENT',
  BANK_TRANSFER = 'BANK_TRANSFER',
  OTHER = 'OTHER',
}

export interface PaymentMethodBreakdownDto {
  paymentMethod: PaymentMethod;
  totalAmount: string; // Decimal as string
  transactionCount: number;
  percentage: number;
}

export interface PaymentBreakdownDto {
  breakdown: PaymentMethodBreakdownDto[];
  startDate: string;
  endDate: string;
}

export interface SalesTrendDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export type DateRangePreset = 'today' | 'week' | 'month' | 'custom';
