/*
  Warnings:

  - You are about to drop the column `currency` on the `Offer` table. All the data in the column will be lost.
  - You are about to drop the column `etaMinutes` on the `Offer` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `Offer` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Offer` table. All the data in the column will be lost.
  - You are about to drop the column `providerId` on the `Offer` table. All the data in the column will be lost.
  - You are about to drop the column `providerName` on the `Offer` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Offer` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Offer` table. All the data in the column will be lost.
  - Added the required column `amount` to the `Offer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expertId` to the `Offer` table without a default value. This is not possible if the table is not empty.
  - Made the column `message` on table `Offer` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Offer" DROP CONSTRAINT "Offer_providerId_fkey";

-- DropIndex
DROP INDEX "Offer_providerId_idx";

-- AlterTable
ALTER TABLE "Offer" DROP COLUMN "currency",
DROP COLUMN "etaMinutes",
DROP COLUMN "expiresAt",
DROP COLUMN "price",
DROP COLUMN "providerId",
DROP COLUMN "providerName",
DROP COLUMN "status",
DROP COLUMN "updatedAt",
ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "expertId" TEXT NOT NULL,
ALTER COLUMN "message" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Offer_expertId_idx" ON "Offer"("expertId");

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_expertId_fkey" FOREIGN KEY ("expertId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
