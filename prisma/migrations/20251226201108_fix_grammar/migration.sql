/*
  Warnings:

  - You are about to drop the column `stakes` on the `Bet` table. All the data in the column will be lost.
  - Added the required column `stake` to the `Bet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bet" DROP COLUMN "stakes",
ADD COLUMN     "stake" DOUBLE PRECISION NOT NULL;
