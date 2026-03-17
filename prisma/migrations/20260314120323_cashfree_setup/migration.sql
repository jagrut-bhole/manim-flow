/*
  Warnings:

  - You are about to drop the column `razorpayPaymentId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `razorpaySubscriptionId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `razorpayCustomerId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cashfreeSubscriptionId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cashfreeCustomerId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "CreditPurchaseStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- DropIndex
DROP INDEX "Subscription_razorpaySubscriptionId_idx";

-- DropIndex
DROP INDEX "Subscription_razorpaySubscriptionId_key";

-- DropIndex
DROP INDEX "User_razorpayCustomerId_key";

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "razorpayPaymentId",
DROP COLUMN "razorpaySubscriptionId",
ADD COLUMN     "cashfreePaymentId" TEXT,
ADD COLUMN     "cashfreeSubscriptionId" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "razorpayCustomerId",
ADD COLUMN     "cashfreeCustomerId" TEXT;

-- CreateTable
CREATE TABLE "CreditPurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "amountPaid" INTEGER NOT NULL,
    "cashfreeOrderId" TEXT NOT NULL,
    "cashfreePaymentId" TEXT,
    "status" "CreditPurchaseStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CreditPurchase_cashfreeOrderId_key" ON "CreditPurchase"("cashfreeOrderId");

-- CreateIndex
CREATE INDEX "CreditPurchase_userId_idx" ON "CreditPurchase"("userId");

-- CreateIndex
CREATE INDEX "CreditPurchase_cashfreeOrderId_idx" ON "CreditPurchase"("cashfreeOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_cashfreeSubscriptionId_key" ON "Subscription"("cashfreeSubscriptionId");

-- CreateIndex
CREATE INDEX "Subscription_cashfreeSubscriptionId_idx" ON "Subscription"("cashfreeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "User_cashfreeCustomerId_key" ON "User"("cashfreeCustomerId");

-- AddForeignKey
ALTER TABLE "CreditPurchase" ADD CONSTRAINT "CreditPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
