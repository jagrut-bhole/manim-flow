/*
  Warnings:

  - You are about to drop the column `view` on the `Animation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Animation" DROP COLUMN "view",
ADD COLUMN     "like" INTEGER NOT NULL DEFAULT 0;
