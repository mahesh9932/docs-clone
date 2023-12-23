/*
  Warnings:

  - The `userId` column on the `Docs` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Docs" DROP COLUMN "userId",
ADD COLUMN     "userId" TEXT[];
