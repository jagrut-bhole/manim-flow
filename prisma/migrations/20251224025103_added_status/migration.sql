/*
  Warnings:

  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "Status" ADD VALUE 'RENDERING';

-- AlterTable
ALTER TABLE "Animation" ADD COLUMN     "download" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "model" TEXT NOT NULL DEFAULT 'llama-3.3-70b-versatile',
ADD COLUMN     "view" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "name" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Animation_status_idx" ON "Animation"("status");

-- CreateIndex
CREATE INDEX "Animation_userId_createdAt_idx" ON "Animation"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");
