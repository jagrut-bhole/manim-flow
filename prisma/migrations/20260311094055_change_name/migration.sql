/*
  Warnings:

  - You are about to drop the column `creditsResultAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "creditsResultAt",
ADD COLUMN     "creditsResetAt" TIMESTAMP(3);
