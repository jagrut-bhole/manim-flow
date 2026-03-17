/*
  Warnings:

  - You are about to drop the column `JobId` on the `Animation` table. All the data in the column will be lost.
  - You are about to drop the column `plan` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Job` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Subscription` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Animation" DROP CONSTRAINT "Animation_JobId_fkey";

-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_userId_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_userId_fkey";

-- DropIndex
DROP INDEX "Animation_JobId_key";

-- AlterTable
ALTER TABLE "Animation" DROP COLUMN "JobId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "plan",
ADD COLUMN     "purchasedCredits" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "Job";

-- DropTable
DROP TABLE "Subscription";

-- DropEnum
DROP TYPE "JobStatus";

-- DropEnum
DROP TYPE "Plan";

-- DropEnum
DROP TYPE "SubscriptionStatus";
