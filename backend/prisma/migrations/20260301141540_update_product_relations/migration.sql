/*
  Warnings:

  - You are about to drop the column `category` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `subCategory` on the `Product` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Product_category_idx";

-- DropIndex
DROP INDEX "Product_subCategory_idx";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "category",
DROP COLUMN "subCategory";

-- CreateIndex
CREATE INDEX "Product_subCategoryId_idx" ON "Product"("subCategoryId");
