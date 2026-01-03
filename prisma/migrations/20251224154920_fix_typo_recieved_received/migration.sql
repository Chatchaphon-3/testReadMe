/*
  Warnings:

  - You are about to drop the column `score_recieved` on the `GameLog` table. All the data in the column will be lost.
  - Added the required column `score_received` to the `GameLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GameLog" DROP COLUMN "score_recieved",
ADD COLUMN     "score_received" DOUBLE PRECISION NOT NULL;
