-- DropForeignKey
ALTER TABLE "Animation" DROP CONSTRAINT "Animation_userId_fkey";

-- AddForeignKey
ALTER TABLE "Animation" ADD CONSTRAINT "Animation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
