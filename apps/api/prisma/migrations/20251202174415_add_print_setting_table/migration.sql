/*
  Warnings:

  - You are about to drop the column `printSettings` on the `StoreSetting` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AutoPrintMode" AS ENUM ('MANUAL', 'AUTO', 'NEVER');

-- CreateEnum
CREATE TYPE "PaperSize" AS ENUM ('COMPACT_58MM', 'STANDARD_80MM');

-- CreateEnum
CREATE TYPE "FontSize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'XLARGE');

-- AlterTable
ALTER TABLE "StoreSetting" DROP COLUMN "printSettings";

-- CreateTable
CREATE TABLE "PrintSetting" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "autoPrintReceipt" "AutoPrintMode" NOT NULL DEFAULT 'MANUAL',
    "receiptCopies" INTEGER NOT NULL DEFAULT 1,
    "showLogo" BOOLEAN NOT NULL DEFAULT true,
    "headerText" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "footerText" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "paperSize" "PaperSize" NOT NULL DEFAULT 'STANDARD_80MM',
    "defaultReceiptPrinter" VARCHAR(100),
    "autoPrintKitchenTicket" BOOLEAN NOT NULL DEFAULT true,
    "kitchenTicketCopies" INTEGER NOT NULL DEFAULT 1,
    "kitchenPaperSize" "PaperSize" NOT NULL DEFAULT 'STANDARD_80MM',
    "kitchenFontSize" "FontSize" NOT NULL DEFAULT 'MEDIUM',
    "showOrderNumber" BOOLEAN NOT NULL DEFAULT true,
    "showTableNumber" BOOLEAN NOT NULL DEFAULT true,
    "showTimestamp" BOOLEAN NOT NULL DEFAULT true,
    "defaultKitchenPrinter" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrintSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PrintSetting_storeId_key" ON "PrintSetting"("storeId");

-- AddForeignKey
ALTER TABLE "PrintSetting" ADD CONSTRAINT "PrintSetting_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
