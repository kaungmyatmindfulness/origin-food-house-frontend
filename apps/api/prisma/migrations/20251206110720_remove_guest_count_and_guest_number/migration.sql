/*
  Warnings:

  - You are about to drop the column `guestCount` on the `ActiveTableSession` table. All the data in the column will be lost.
  - You are about to drop the column `guestNumber` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `capacity` on the `Table` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Payment_orderId_guestNumber_idx";

-- AlterTable
ALTER TABLE "ActiveTableSession" DROP COLUMN "guestCount";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "guestNumber";

-- AlterTable
ALTER TABLE "Table" DROP COLUMN "capacity";
