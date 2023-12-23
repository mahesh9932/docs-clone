/*
  Warnings:

  - Added the required column `userId` to the `Docs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Docs" ADD COLUMN     "userId" TEXT NOT NULL;
