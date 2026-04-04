/*
  Warnings:

  - You are about to drop the column `targetId` on the `Banner` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Banner` table without a default value. This is not possible if the table is not empty.
  - Made the column `targetScreen` on table `Banner` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Banner" DROP COLUMN "targetId",
ADD COLUMN     "ctaText" TEXT,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "linkId" INTEGER,
ADD COLUMN     "linkType" TEXT NOT NULL DEFAULT 'NONE',
ADD COLUMN     "linkUrl" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "subtitle" TEXT,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "targetScreen" SET NOT NULL,
ALTER COLUMN "targetScreen" SET DEFAULT 'home';
