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

/**
 * Auto-print mode for receipts
 */
export enum AutoPrintMode {
  /** Print manually via button click */
  MANUAL = 'manual',
  /** Automatically print after payment */
  AUTO = 'auto',
  /** Never print receipts */
  NEVER = 'never',
}

/**
 * Default print settings values
 * Used when store settings don't have print settings configured
 */
export const DEFAULT_PRINT_SETTINGS: PrintSettingsDto = {
  autoPrintReceipt: AutoPrintMode.MANUAL,
  autoPrintKitchenTicket: true,
  receiptCopies: 1,
  kitchenTicketCopies: 1,
  showLogo: true,
  headerText: [],
  footerText: [],
};

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
      'Receipt auto-print mode: manual (button click), auto (after payment), never',
  })
  @IsEnum(AutoPrintMode, {
    message: 'autoPrintReceipt must be one of: manual, auto, never',
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
  defaultReceiptPrinter?: string;

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
  defaultKitchenPrinter?: string;

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
}

/**
 * DTO for updating print settings
 * All fields are optional to allow partial updates
 */
export class UpdatePrintSettingsDto extends PartialType(PrintSettingsDto) {}
