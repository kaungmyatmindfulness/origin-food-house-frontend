import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import {
  AutoPrintMode,
  FontSize,
  PaperSize,
} from 'src/generated/prisma/client';

// Re-export Prisma enums for convenience
export { AutoPrintMode, FontSize, PaperSize };

/**
 * Print settings configuration for a store
 * Controls receipt and kitchen ticket printing behavior
 */
export class PrintSettingsDto {
  @ApiProperty({
    enum: AutoPrintMode,
    enumName: 'AutoPrintMode',
    example: AutoPrintMode.MANUAL,
    description:
      'Receipt auto-print mode: MANUAL (button click), AUTO (after payment), NEVER',
  })
  @IsEnum(AutoPrintMode, {
    message: 'autoPrintReceipt must be one of: MANUAL, AUTO, NEVER',
  })
  autoPrintReceipt: AutoPrintMode;

  @ApiProperty({
    type: Boolean,
    example: true,
    description:
      'Whether to automatically print kitchen tickets when orders are placed',
  })
  @IsBoolean({ message: 'autoPrintKitchenTicket must be a boolean' })
  autoPrintKitchenTicket: boolean;

  @ApiPropertyOptional({
    type: String,
    example: 'Front Counter Printer',
    description: 'Name/identifier of the default receipt printer',
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'defaultReceiptPrinter must be a string' })
  @MaxLength(100, {
    message: 'defaultReceiptPrinter must not exceed 100 characters',
  })
  @Transform(({ value }: { value: string }) => value?.trim())
  defaultReceiptPrinter?: string | null;

  @ApiPropertyOptional({
    type: String,
    example: 'Kitchen Printer',
    description: 'Name/identifier of the default kitchen ticket printer',
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'defaultKitchenPrinter must be a string' })
  @MaxLength(100, {
    message: 'defaultKitchenPrinter must not exceed 100 characters',
  })
  @Transform(({ value }: { value: string }) => value?.trim())
  defaultKitchenPrinter?: string | null;

  @ApiProperty({
    type: Number,
    minimum: 1,
    maximum: 5,
    example: 1,
    description: 'Number of receipt copies to print (1-5)',
  })
  @IsInt({ message: 'receiptCopies must be an integer' })
  @Min(1, { message: 'receiptCopies must be at least 1' })
  @Max(5, { message: 'receiptCopies must not exceed 5' })
  receiptCopies: number;

  @ApiProperty({
    type: Number,
    minimum: 1,
    maximum: 5,
    example: 1,
    description: 'Number of kitchen ticket copies to print (1-5)',
  })
  @IsInt({ message: 'kitchenTicketCopies must be an integer' })
  @Min(1, { message: 'kitchenTicketCopies must be at least 1' })
  @Max(5, { message: 'kitchenTicketCopies must not exceed 5' })
  kitchenTicketCopies: number;

  @ApiProperty({
    type: Boolean,
    example: true,
    description: 'Whether to show store logo on receipts',
  })
  @IsBoolean({ message: 'showLogo must be a boolean' })
  showLogo: boolean;

  @ApiProperty({
    type: [String],
    example: ['Welcome to Our Restaurant', 'Thank you for dining with us!'],
    description: 'Array of header text lines to print on receipts',
  })
  @IsArray({ message: 'headerText must be an array' })
  @IsString({ each: true, message: 'Each header text line must be a string' })
  @MaxLength(100, {
    each: true,
    message: 'Each header text line must not exceed 100 characters',
  })
  @Transform(({ value }: { value: string[] }) =>
    Array.isArray(value) ? value.map((s) => s?.trim()).filter(Boolean) : value
  )
  headerText: string[];

  @ApiProperty({
    type: [String],
    example: ['Thank you for visiting!', 'Please come again'],
    description: 'Array of footer text lines to print on receipts',
  })
  @IsArray({ message: 'footerText must be an array' })
  @IsString({ each: true, message: 'Each footer text line must be a string' })
  @MaxLength(100, {
    each: true,
    message: 'Each footer text line must not exceed 100 characters',
  })
  @Transform(({ value }: { value: string[] }) =>
    Array.isArray(value) ? value.map((s) => s?.trim()).filter(Boolean) : value
  )
  footerText: string[];

  // ==================== Paper Size Settings ====================

  @ApiProperty({
    enum: PaperSize,
    enumName: 'PaperSize',
    example: PaperSize.STANDARD_80MM,
    description:
      'Paper size for customer receipts (COMPACT_58MM or STANDARD_80MM)',
  })
  @IsEnum(PaperSize, {
    message: 'paperSize must be one of: COMPACT_58MM, STANDARD_80MM',
  })
  paperSize: PaperSize;

  @ApiProperty({
    enum: PaperSize,
    enumName: 'PaperSize',
    example: PaperSize.STANDARD_80MM,
    description:
      'Paper size for kitchen tickets (COMPACT_58MM or STANDARD_80MM)',
  })
  @IsEnum(PaperSize, {
    message: 'kitchenPaperSize must be one of: COMPACT_58MM, STANDARD_80MM',
  })
  kitchenPaperSize: PaperSize;

  // ==================== Kitchen Ticket Display Settings ====================

  @ApiProperty({
    enum: FontSize,
    enumName: 'FontSize',
    example: FontSize.MEDIUM,
    description:
      'Font size for kitchen tickets (larger = more readable in busy kitchens)',
  })
  @IsEnum(FontSize, {
    message: 'kitchenFontSize must be one of: SMALL, MEDIUM, LARGE, XLARGE',
  })
  kitchenFontSize: FontSize;

  @ApiProperty({
    type: Boolean,
    example: true,
    description: 'Whether to show order number on kitchen tickets',
  })
  @IsBoolean({ message: 'showOrderNumber must be a boolean' })
  showOrderNumber: boolean;

  @ApiProperty({
    type: Boolean,
    example: true,
    description: 'Whether to show table number on kitchen tickets',
  })
  @IsBoolean({ message: 'showTableNumber must be a boolean' })
  showTableNumber: boolean;

  @ApiProperty({
    type: Boolean,
    example: true,
    description: 'Whether to show timestamp on kitchen tickets',
  })
  @IsBoolean({ message: 'showTimestamp must be a boolean' })
  showTimestamp: boolean;
}

/**
 * Base response DTO for print settings with common fields
 * Used as the foundation for both GET and UPDATE responses
 */
class PrintSettingBaseResponseDto extends PrintSettingsDto {
  @ApiProperty({ format: 'uuid', description: 'Print setting record ID' })
  id: string;

  @ApiProperty({
    format: 'uuid',
    description: 'ID of the associated store',
  })
  storeId: string;

  @ApiProperty({ description: 'Record creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Record last update timestamp' })
  updatedAt: Date;
}

/**
 * Response DTO for GET print settings endpoint
 * Can return null if print settings have not been configured yet
 */
export class GetPrintSettingResponseDto extends PrintSettingBaseResponseDto {}

/**
 * Response DTO for UPDATE print settings endpoint
 * Always returns the updated print settings (upsert ensures it exists)
 */
export class UpdatePrintSettingResponseDto extends PrintSettingBaseResponseDto {}

/**
 * DTO for updating print settings
 * All fields are optional to allow partial updates
 */
export class UpdatePrintSettingsDto extends PartialType(PrintSettingsDto) {}
