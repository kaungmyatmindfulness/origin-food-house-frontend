/**
 * Zod schemas for Print feature form validation.
 * These schemas define validation rules for print settings forms.
 */

import { z } from 'zod';

/**
 * Zod schema for receipt settings form validation.
 */
export const receiptSettingsSchema = z.object({
  autoPrintReceipt: z.enum(['manual', 'auto', 'never']),
  receiptCopies: z.coerce.number().int().min(1).max(10),
  showLogo: z.boolean(),
  headerText: z.array(z.string().max(100)).max(5),
  footerText: z.array(z.string().max(100)).max(5),
  paperSize: z.enum(['58mm', '80mm']),
  defaultReceiptPrinter: z.string().optional(),
});

export type ReceiptSettingsFormValues = z.infer<typeof receiptSettingsSchema>;

/**
 * Zod schema for kitchen ticket settings form validation.
 */
export const kitchenSettingsSchema = z.object({
  autoPrintKitchenTicket: z.boolean(),
  kitchenTicketCopies: z.coerce.number().int().min(1).max(10),
  kitchenPaperSize: z.enum(['58mm', '80mm']),
  kitchenFontSize: z.enum(['small', 'medium', 'large', 'xlarge']),
  showOrderNumber: z.boolean(),
  showTableNumber: z.boolean(),
  showTimestamp: z.boolean(),
  defaultKitchenPrinter: z.string().optional(),
});

export type KitchenSettingsFormValues = z.infer<typeof kitchenSettingsSchema>;

/**
 * Combined Zod schema for all print settings.
 */
export const printSettingsSchema = receiptSettingsSchema.merge(
  kitchenSettingsSchema
);

export type PrintSettingsFormValues = z.infer<typeof printSettingsSchema>;
