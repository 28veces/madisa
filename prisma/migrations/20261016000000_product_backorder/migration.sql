-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "allowBackorder" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "SaleItem" ADD COLUMN     "backorderQuantity" INTEGER NOT NULL DEFAULT 0;

